#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# Thin launcher: delegates to the TypeScript hook bridge in mcp-server/dist.

require 'json'
require 'open3'

script = File.expand_path('../mcp-server/dist/cli/adherence-append-action-attempted.js', __dir__)
unless File.file?(script)
  warn "DIAGNOSTIC: adherence_append_action_attempted: missing #{script} (run npm run build --prefix mcp-server)"
  exit 0
end

options = { hook_log_path: '/tmp/hook.yaml', hook_log_line: 1 }
payload_path = nil
marker_path = nil
argv = ARGV.dup

while (arg = argv.shift)
  case arg
  when '--marker'
    marker_path = argv.shift
  when '--hook-log-path'
    options[:hook_log_path] = argv.shift
  when '--hook-log-line'
    options[:hook_log_line] = argv.shift.to_i
  when '--payload'
    payload_path = argv.shift
  else
    payload_path ||= arg
  end
end

cmd = [
  'node', script,
  '--hook-log-path', options[:hook_log_path].to_s,
  '--hook-log-line', options[:hook_log_line].to_s
]
cmd.concat(['--marker', marker_path]) if marker_path

if payload_path && File.exist?(payload_path)
  system(*cmd, payload_path)
else
  Open3.popen3(*cmd) do |stdin, _stdout, _stderr, wait_thr|
    stdin.write($stdin.read)
    stdin.close
    wait_thr.value
  end
end

exit 0
