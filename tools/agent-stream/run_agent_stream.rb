#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'open3'
require 'shellwords'
require_relative 'lib/agent_stream_argv'
require_relative 'lib/feature_spec_batch_prompts'

if (preview_i = ARGV.index('--preview-feature-spec-batch-yaml'))
  path = ARGV[preview_i + 1]
  unless path
    warn 'missing value for --preview-feature-spec-batch-yaml'
    AgentStreamArgv.usage
    exit 1
  end
  unless File.file?(path)
    warn "not a file: #{path}"
    exit 1
  end
  order_filter = nil
  if (oi = ARGV.rindex('--feature-spec-batch-order'))
    val = ARGV[oi + 1]
    if val.nil? || val.start_with?('--')
      warn 'missing value for --feature-spec-batch-order'
      AgentStreamArgv.usage
      exit 1
    end
    begin
      order_filter = FeatureSpecBatchPrompts.order_filter_from_arg(val)
    rescue ArgumentError => e
      warn e.message
      exit 1
    end
  end
  begin
    FeatureSpecBatchPrompts.print_preview(path, order_filter: order_filter)
  rescue ArgumentError => e
    warn e.message
    exit 1
  end
  exit 0
end

def agent_command(session_id, workspace, prompt_parts)
  cmd = %w[agent --print --output-format stream-json]
  cmd += ['--model', 'Auto']
  # auto - Auto  (current)
  # composer-2-fast - Composer 2 Fast
  # composer-2 - Composer 2
  # claude-4.6-opus-high-thinking - Opus 4.6 1M Thinking  (default)
  # claude-4.6-opus-high
  # gpt-5.4-low - GPT-5.4 1M Low

  cmd += ['--trust'] # Trust the current workspace without prompting
  cmd += ['--force'] # Force allow commands unless explicitly denied
  cmd += ['--workspace', workspace] if workspace
  cmd += ['--resume', session_id] if session_id
  cmd.concat(prompt_parts)
  cmd
end

def extract_text_fragments(obj)
  frags = []
  case obj['type']
  when 'thinking'
    if obj['subtype'] == 'delta' && obj['text']
      frags << obj['text']
    end
  when 'assistant'
    msg = obj['message']
    return frags unless msg.is_a?(Hash) && msg['content'].is_a?(Array)

    msg['content'].each do |part|
      next unless part.is_a?(Hash) && part['type'] == 'text' && part['text']

      frags << part['text']
    end
  end
  frags
end

def run_stream(cmd)
  captured_session = nil

  Open3.popen3(*cmd) do |stdin, stdout, stderr, wait_thr|
    stdin.close

    stderr_thread = Thread.new do
      stderr.each_line { |l| $stderr.print l }
    end

    stdout.each_line do |line|
      line = line.strip
      next if line.empty?

      begin
        obj = JSON.parse(line)
      rescue JSON::ParserError => e
        warn "JSON parse error: #{e.message}"
        next
      end

      captured_session ||= obj['session_id'] if obj['session_id']

      extract_text_fragments(obj).each { |fragment| print fragment }

      puts if obj['type'] == 'thinking' && obj['subtype'] == 'completed'
    end

    stderr_thread.join

    status = wait_thr.value
    unless status.success?
      warn "agent exited with status #{status.exitstatus}"
      exit(status.exitstatus || 1)
    end
  end

  $stderr.puts "session_id=#{captured_session}" if captured_session

  captured_session
end

begin
  initial_cli_session, workspace, turns, dry_run, chain_between, preload_parts = AgentStreamArgv.parse_argv(ARGV)
rescue ArgumentError => e
  warn e.message
  AgentStreamArgv.usage
  exit 1
end

$stdout.sync = true if dry_run

running = nil
turns.each_with_index do |prompt_parts, idx|
  session_for_cmd = if idx.zero?
                      initial_cli_session
                    elsif chain_between[idx - 1]
                      running
                    end

  new_session = session_for_cmd.nil? || session_for_cmd == ''
  parts = if !preload_parts.empty? && new_session
            preload_parts + prompt_parts
          else
            prompt_parts
          end

  label = session_for_cmd ? " (resume #{session_for_cmd})" : ' (new session)'
  $stderr.puts "\n--- turn #{idx + 1}/#{turns.size}#{label} ---\n"

  cmd = agent_command(session_for_cmd, workspace, parts)

  if dry_run
    n = parts.size
    parts.each_with_index do |part, i|
      puts "--- argv part #{i + 1}/#{n} ---"
      puts part
    end
    puts "command: #{Shellwords.join(cmd)}"
    if idx.zero? && turns.size > 1
      warn 'dry-run: chained turns use --resume with the session_id from the previous turn; each ' \
           '--feature-spec-batch-yaml record after a prior turn omits --resume (new session). ' \
           '--prompt-file content is prepended on every new session (not a separate turn). ' \
           'An initial --session-id only applies to turn 1.'
    end
    running = 'dry-run-session-placeholder'
    next
  end

  resume_id = run_stream(cmd)

  unless resume_id
    warn 'No session_id in stream; cannot continue with --resume'
    exit 1
  end

  running = resume_id
end
