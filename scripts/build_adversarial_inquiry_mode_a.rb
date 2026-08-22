#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_FILES] [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY]
# How: Assemble a scoped normalized-input inquiry payload with explicit policy and evidence provenance.

# Build a normalized-input payload for tied_adversarial_inquiry_run without
# requiring callers to hand-author the JSON envelope.

require "json"
require "optparse"

options = {
  policy: "advisory",
  scope: [],
}

parser = OptionParser.new do |opts|
  opts.banner = "Usage: build_adversarial_inquiry_mode_a.rb [options]"
  opts.on("--graph FILE", "Normalized obligation graph JSON") { |value| options[:graph] = value }
  opts.on("--fidelity FILE", "Normalized fidelity evidence JSON") { |value| options[:fidelity] = value }
  opts.on("--provenance FILE", "Evidence provenance JSON") { |value| options[:provenance] = value }
  opts.on("--scope ID", "Scoped block or obligation ID (repeatable)") { |value| options[:scope] << value }
  opts.on("--project-root PATH", "Absolute audited project root") { |value| options[:repository_root] = value }
  opts.on("--request-token TOKEN", "Request REQ token") { |value| options[:request_token] = value }
  opts.on("--policy POLICY", %w[advisory strict-candidate strict-approved], "Gate policy") do |value|
    options[:policy] = value
  end
end
parser.parse!

required = %i[graph fidelity repository_root request_token]
missing = required.select { |key| options[key].to_s.empty? }
missing << :scope if options[:scope].empty?
abort("#{parser}\nMissing: #{missing.join(", ")}") unless missing.empty?

def read_json(path)
  JSON.parse(File.read(path, encoding: "UTF-8"))
rescue Errno::ENOENT => error
  abort("Cannot read #{path}: #{error.message}")
rescue JSON::ParserError => error
  abort("Invalid JSON in #{path}: #{error.message}")
end

payload = {
  "graph" => read_json(options[:graph]),
  "fidelity" => read_json(options[:fidelity]),
  "scope" => options[:scope],
  "policy" => options[:policy],
  "repository_root" => options[:repository_root],
  "request_token" => options[:request_token],
}
payload["provenance"] = read_json(options[:provenance]) if options[:provenance]

puts JSON.pretty_generate(payload)
