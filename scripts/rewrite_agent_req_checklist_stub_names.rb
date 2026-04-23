#!/usr/bin/env ruby
# frozen_string_literal: true

# Stub-first rewrites for tied/docs/agent-req-implementation-checklist.yaml (and copies).
# Preserves comments, YAML layout, clear_ids (sed canonical ids), and step id: fields.
# Usage: ruby scripts/rewrite_agent_req_checklist_stub_names.rb PATH [PATH2 ...]

STEP = {
  "session-bootstrap" => "session-bootstrap",
  "translate-sponsor-intent" => "translate-sponsor-intent",
  "change-definition" => "change-definition",
  "impact-discovery" => "impact-discovery",
  "author-requirement" => "author-requirement",
  "author-architecture" => "author-architecture",
  "catalog-pseudocode-contracts" => "catalog-pseudocode-contracts",
  "flag-insufficient-specs" => "flag-insufficient-specs",
  "flag-contradictory-specs" => "flag-contradictory-specs",
  "resolve-pseudocode" => "resolve-pseudocode",
  "apply-token-comments" => "apply-token-comments",
  "gate-pseudocode-validation" => "gate-pseudocode-validation",
  "persist-implementation-records" => "persist-implementation-records",
  "risk-assessment" => "risk-assessment",
  "test-strategy" => "test-strategy",
  "unit-test-red" => "unit-test-red",
  "unit-test-green" => "unit-test-green",
  "unit-refactor" => "unit-refactor",
  "three-way-alignment-unit" => "three-way-alignment-unit",
  "composition-integration" => "composition-integration",
  "end-to-end-ui" => "end-to-end-ui",
  "verification-gate" => "verification-gate",
  "sync-tied-stack" => "sync-tied-stack",
  "user-facing-release-notes" => "user-facing-release-notes",
  "persist-citdp-record" => "persist-citdp-record",
  "traceable-commit" => "traceable-commit"
}.freeze

SUB = {
  "sub-yaml-edit-loop" => "sub-yaml-edit-loop",
  "sub-pseudocode-validation-pass" => "sub-pseudocode-validation-pass",
  "sub-leap-micro-cycle" => "leap-micro-cycle"
}.freeze

ORDER = (STEP.keys + SUB.keys).sort_by { |k| [-k.length, k] }.freeze

# Replace hyphenated ranges before single-token replace (avoids broken merges).
COMPOUND_TEXT = [
  ["change-definition-impact-discovery", "change-definition … impact-discovery"],
  ["author-requirement-S06", "author-requirement … persist-implementation-records"]
].freeze

def replace_tokens(str)
  out = str.dup
  COMPOUND_TEXT.each { |old, new| out.gsub!(old, new) }
  ORDER.each do |oid|
    stub = STEP[oid] || SUB[oid]
    out.gsub!(oid, stub) if stub
  end
  out.gsub!(/\bS06\b/, "IMPL phase (stubs catalog-pseudocode-contracts … persist-implementation-records)")
  out
end

def transform_file(path)
  text = File.read(path, encoding: "UTF-8")

  blocks = []
  text = text.gsub(%r{^(\s+clear_ids:\s*\n(?:\s+-\s+[^\n]+\n)+)}m) do
    blocks << Regexp.last_match(1)
    "<<<CLEAR_IDS_BLOCK_#{blocks.length - 1}>>>"
  end

  id_lines = []
  text.gsub!(/^(\s+-\s+id:\s+[^\n]+\n)/m) do
    id_lines << Regexp.last_match(1)
    "<<<STEP_ID_LINE_#{id_lines.length - 1}>>>"
  end

  comments = []
  text.gsub!(/^(\s*#\s*id\s+[^\n]+\n)/) do
    comments << Regexp.last_match(1)
    "<<<ID_COMMENT_#{comments.length - 1}>>>"
  end

  text = replace_tokens(text)

  blocks.each_with_index { |b, i| text.sub!("<<<CLEAR_IDS_BLOCK_#{i}>>>", b) }
  id_lines.each_with_index { |b, i| text.sub!("<<<STEP_ID_LINE_#{i}>>>", b) }
  comments.each_with_index { |b, i| text.sub!("<<<ID_COMMENT_#{i}>>>", b) }

  File.write(path, text, encoding: "UTF-8")
  warn "updated #{path}"
end

ARGV.each { |p| transform_file(p) }
