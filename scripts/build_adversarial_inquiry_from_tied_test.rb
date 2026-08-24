#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
# How: Smoke-test Go/non-Ruby Mode A builder output against the rootjobs reference fixture.

require "digest"
require "fileutils"
require "json"
require "open3"
require "tmpdir"

ROOT = File.expand_path("..", __dir__)
BUILDER = File.join(ROOT, "scripts", "build_adversarial_inquiry_from_tied.rb")
MODE_A_BUILDER = File.join(ROOT, "scripts", "build_adversarial_inquiry_mode_a.rb")
FIXTURE_ROOT = File.join(
  ROOT,
  "mcp-server",
  "test",
  "fixtures",
  "adversarial-inquiry-go-rootjobs",
)
PILOT_ROOT = "/Users/fareed/Documents/dev/test/1787507684"

def assert(condition, message)
  raise message unless condition
end

def assert_equal(expected, actual, message)
  raise "#{message}\nexpected: #{expected.inspect}\nactual:   #{actual.inspect}" unless expected == actual
end

def read_json(path)
  JSON.parse(File.read(path, encoding: "UTF-8"))
end

def run_builder(args)
  cmd = ["ruby", BUILDER, *args]
  stdout, stderr, status = Open3.capture3(*cmd)
  [stdout, stderr, status]
end

def deep_sort(value)
  case value
  when Hash
    value.keys.sort.each_with_object({}) { |key, acc| acc[key] = deep_sort(value[key]) }
  when Array
    value.map { |item| deep_sort(item) }
  else
    value
  end
end

puts "DEBUG: ruby syntax check"
syntax_out, syntax_err, syntax_status = Open3.capture3("ruby", "-c", BUILDER)
assert syntax_status.success?, "ruby -c failed: #{syntax_err}"
puts syntax_out

puts "DEBUG: project_id hash matches pilot tied base"
expected_project_id = Digest::SHA256.hexdigest(File.expand_path("#{PILOT_ROOT}/tied"))[0, 16]
assert_equal("bd6908f862145619", expected_project_id, "pilot project_id derivation")

fixture_graph = read_json(File.join(FIXTURE_ROOT, "graph.json"))
fixture_fidelity = read_json(File.join(FIXTURE_ROOT, "fidelity.json"))
build_config = File.join(FIXTURE_ROOT, "build-config.yaml")

assert File.directory?(PILOT_ROOT), "Pilot project root missing at #{PILOT_ROOT}; skip live regression if unavailable"

Dir.mktmpdir("from-tied-test-") do |tmpdir|
  puts "DEBUG: builder emits graph/fidelity matching fixture"
  stdout, stderr, status = run_builder(
    [
      "--build-config", build_config,
      "--project-root", PILOT_ROOT,
      "--tied-base-path", File.join(PILOT_ROOT, "tied"),
      "--output-dir", tmpdir,
    ],
  )
  assert status.success?, "builder failed: #{stderr}"

  payload = JSON.parse(stdout)
  built_graph = payload.fetch("graph")
  built_fidelity = payload.fetch("fidelity")

  assert_equal(
    deep_sort(fixture_graph),
    deep_sort(built_graph),
    "built graph differs from fixture",
  )
  assert_equal(
    deep_sort(fixture_fidelity),
    deep_sort(built_fidelity),
    "built fidelity differs from fixture",
  )

  assert_equal("bd6908f862145619", built_graph.fetch("projectId"), "projectId injection")

  written_graph = read_json(File.join(tmpdir, "graph.json"))
  assert_equal(deep_sort(fixture_graph), deep_sort(written_graph), "graph.json on disk")

  puts "DEBUG: emit-mode-a assembles normalized envelope"
  mode_a_stdout, mode_a_stderr, mode_a_status = run_builder(
    [
      "--build-config", build_config,
      "--project-root", PILOT_ROOT,
      "--tied-base-path", File.join(PILOT_ROOT, "tied"),
      "--request-token", "REQ-ROOTJOBS",
      "--emit-mode-a",
      "--scope", "IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de",
      "--run-id", "rootjobs-fixture-smoke",
      "--phase", "pre_implementation",
    ],
  )
  assert mode_a_status.success?, "emit-mode-a failed: #{mode_a_stderr}"

  envelope = JSON.parse(mode_a_stdout)
  %w[graph fidelity scope policy repository_root request_token run_id phase].each do |key|
    assert envelope.key?(key), "Mode A envelope missing #{key}"
  end
  assert_equal("REQ-ROOTJOBS", envelope.fetch("request_token"), "request_token")
  assert_equal(["IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de"], envelope.fetch("scope"), "scope")
  assert_equal(deep_sort(fixture_graph), deep_sort(envelope.fetch("graph")), "Mode A graph payload")
end

puts "DEBUG: path-only skeleton builder"
Dir.mktmpdir("from-tied-skeleton-") do |tmpdir|
  stdout, stderr, status = run_builder(
    [
      "--project-root", PILOT_ROOT,
      "--tied-base-path", File.join(PILOT_ROOT, "tied"),
      "--request-token", "REQ-ROOTJOBS",
      "--block-id", "IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de",
      "--source-revision", "citdp-fixture-smoke",
      "--test-path", "tools/rootjobs/internal/tree/tree_test.go",
      "--production-path", "tools/rootjobs/internal/tree/tree.go",
      "--output-dir", tmpdir,
    ],
  )
  assert status.success?, "skeleton builder failed: #{stderr}"
  skeleton = JSON.parse(stdout)
  assert skeleton.dig("graph", "projectId") == "bd6908f862145619", "skeleton projectId"
  assert skeleton.dig("graph", "evidenceLoci").any?, "skeleton evidence loci"
  assert skeleton.dig("fidelity", "testEvidence").any?, "skeleton test evidence"
end

puts "PASS build_adversarial_inquiry_from_tied_test.rb"
