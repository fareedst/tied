#!/usr/bin/env ruby
# frozen_string_literal: true

# Append-only bridge: active-turn marker → action_attempted ledger row.
# [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Fail-silent when marker absent.

require 'digest'
require 'json'
require 'fileutils'
require 'time'

module AdherenceAppendActionAttempted
  ALLOWLIST = %w[postToolUse afterShellExecution afterMCPExecution].freeze

  module_function

  def call(record, hook_log_path:, hook_log_line:)
    return unless ALLOWLIST.include?(record['hook_event_name'].to_s)

    marker = read_marker(record)
    return unless marker

    ledger_path = resolve_ledger_path(marker, record)
    return unless ledger_path && File.exist?(File.dirname(ledger_path))

    row = build_row(marker, record, hook_log_path, hook_log_line)
    return unless row

    append_row(ledger_path, row)
  rescue StandardError => e
    warn "DIAGNOSTIC: adherence_append_action_attempted fail-silent: #{e.class}: #{e.message}"
    nil
  end

  def read_marker(record)
    workspace = workspace_root(record)
    return nil if workspace.nil? || workspace.empty?

    token = record.dig('active_turn', 'request_token')
    marker_path = record.dig('active_turn', 'marker_path')
    if marker_path.nil? || marker_path.empty?
      token ||= infer_request_token(workspace)
      return nil if token.nil? || token.empty?

      marker_path = File.join(workspace, 'working', token, 'adherence', 'active-turn.json')
    end
    return nil unless File.exist?(marker_path)

    JSON.parse(File.read(marker_path, mode: 'r:utf-8'))
  rescue JSON::ParserError, Errno::ENOENT
    nil
  end

  def infer_request_token(workspace)
    marker_glob = Dir.glob(File.join(workspace, 'working', 'REQ-*', 'adherence', 'active-turn.json'))
    return nil if marker_glob.empty?

    JSON.parse(File.read(marker_glob.first, mode: 'r:utf-8'))['request_token']
  rescue StandardError
    nil
  end

  def resolve_ledger_path(marker, record)
    raw = marker['adherence_ledger_path'].to_s
    return nil if raw.empty?

    return raw if raw.start_with?('/')

    workspace = marker['workspace_root'].to_s
    workspace = workspace_root(record) if workspace.empty?
    File.expand_path(raw, workspace)
  end

  def workspace_root(record)
    roots = Array(record['workspace_roots'])
    return roots.first.to_s unless roots.empty?

    rel = record['relative_path'].to_s
    return nil if rel.empty?

    "/Users/fareed/Documents/dev/#{rel.tr('_', '/')}"
  end

  def build_row(marker, record, hook_log_path, hook_log_line)
    hook = record['hook_event_name'].to_s
    refs = evidence_refs_for(record, hook)
    return nil if refs.empty?

    corr = {
      'request_token' => marker['request_token'],
      'run_id' => marker['run_id'],
      'turn_index' => marker['turn_index'],
      'step_slug' => marker['step_slug'],
      'instruction_hash' => marker['instruction_hash'],
      'instruction_nonce' => marker['instruction_nonce']
    }
    tool_use_id = record.dig('normalized', 'details', 'tool_use_id')
    corr['tool_use_id'] = tool_use_id if tool_use_id && !tool_use_id.to_s.empty?

    {
      'schema_version' => 'agent-adherence-event.v1',
      'event_class' => 'action_attempted',
      'correlation' => corr,
      'evidence_refs' => refs,
      'hook_log_ref' => {
        'path' => hook_log_path.to_s,
        'line' => hook_log_line.to_i
      },
      'source' => {
        'kind' => 'cursor_hook',
        'hook_event' => hook
      }
    }
  end

  def evidence_refs_for(record, hook)
    details = record.dig('normalized', 'details') || {}
    case hook
    when 'postToolUse'
      name = details['tool_name'].to_s.strip
      return [] if name.empty?

      ["tool:#{name}"]
    when 'afterShellExecution'
      command = details['command'].to_s
      normalized = command.strip.gsub(/\s+/, ' ')
      return [] if normalized.empty?

      digest = Digest::SHA256.hexdigest(normalized)
      ["shell:sha256:#{digest}"]
    when 'afterMCPExecution'
      server = record.dig('original', 'mcp_server').to_s.strip
      server = record.dig('original', 'server').to_s.strip if server.empty?
      tool = details['tool_name'].to_s.strip
      return [] if server.empty? || tool.empty?

      ["mcp:#{server}.#{tool}"]
    else
      []
    end
  end

  def append_row(ledger_path, row)
    FileUtils.mkdir_p(File.dirname(ledger_path))
    File.open(ledger_path, 'a:utf-8') do |f|
      f.write(JSON.generate(row))
      f.write("\n")
    end
  end

  # CLI entry for tests and fake agents.
  def run_cli(argv)
    options = { hook_log_path: '/tmp/hook.yaml', hook_log_line: 1 }
    payload_path = nil
    marker_path = nil

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

    payload = if payload_path && File.exist?(payload_path)
                JSON.parse(File.read(payload_path, mode: 'r:utf-8'))
              else
                JSON.parse($stdin.read)
              end

    if marker_path
      marker = JSON.parse(File.read(marker_path, mode: 'r:utf-8'))
      payload['active_turn'] = {
        'marker_path' => marker_path,
        'request_token' => marker['request_token']
      }
      payload['workspace_roots'] ||= [marker['workspace_root']] if marker['workspace_root']
    end

    call(payload, **options)
    0
  rescue StandardError => e
    warn "DIAGNOSTIC: adherence_append_action_attempted cli: #{e.message}"
    0
  end
end

exit AdherenceAppendActionAttempted.run_cli(ARGV) if __FILE__ == $PROGRAM_NAME
