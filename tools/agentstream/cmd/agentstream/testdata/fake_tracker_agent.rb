#!/usr/bin/env ruby
# [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Fake agent emitting agentstream_tracker receipts.
require "json"
require "open3"

def simulate_adherence_hook_append(step)
  workspace = ENV["ADHERENCE_WORKSPACE"]
  token = ENV["REQUEST_TOKEN"]
  return unless workspace && !workspace.empty? && token && !token.empty?

  marker_path = File.join(workspace, "working", token, "adherence", "active-turn.json")
  return unless File.exist?(marker_path)

  script = File.expand_path("../../../../../scripts/adherence_append_action_attempted.rb", __dir__)
  evidence_ref = "evidence/#{step}.md"
  payload = {
    hook_event_name: "postToolUse",
    workspace_roots: [workspace],
    normalized: {
      details: {
        tool_name: "Shell",
        tool_use_id: "fake-#{step}"
      }
    },
    active_turn: {
      marker_path: marker_path,
      request_token: token
    }
  }
  # Composition tests match tracker evidence_refs on file paths; append directly when simulating.
  if ENV["ADHERENCE_SIMULATE_EVIDENCE_REF"] == "1"
    marker = JSON.parse(File.read(marker_path))
    ledger = marker["adherence_ledger_path"]
    row = {
      schema_version: "agent-adherence-event.v1",
      event_class: "action_attempted",
      correlation: {
        request_token: marker["request_token"],
        run_id: marker["run_id"],
        turn_index: marker["turn_index"],
        step_slug: marker["step_slug"],
        instruction_hash: marker["instruction_hash"],
        instruction_nonce: marker["instruction_nonce"]
      },
      evidence_refs: [evidence_ref],
      hook_log_ref: { path: "/tmp/fake-hook.yaml", line: 1 },
      source: { kind: "cursor_hook", hook_event: "postToolUse" }
    }
    File.open(ledger, "a") { |f| f.puts(JSON.generate(row)) }
    return
  end

  Open3.popen3("ruby", script, "--marker", marker_path, stdin_data: JSON.generate(payload)) do |_in, _out, _err, wait|
    wait.value
  end
rescue StandardError => e
  warn "DIAGNOSTIC: fake_tracker_agent hook simulation: #{e.message}"
end

prompt = ARGV.join("\n")
step =
  if prompt.include?("## Step step-one:")
    "step-one"
  elsif prompt.include?("## Step step-two:")
    "step-two"
  else
    "unknown"
  end

simulate_adherence_hook_append(step) unless step == "unknown"

text = +"fake tracker agent processed #{step}\n"
unless ENV["OMIT_TRACKER_RECEIPT"] == "1"
  evidence_refs =
    if ENV["EVIDENCE_REFS"] && !ENV["EVIDENCE_REFS"].empty?
      JSON.parse(ENV["EVIDENCE_REFS"])
    else
      ["evidence/#{step}.md"]
    end
  receipt = {
    agentstream_tracker: {
      schema_version: 1,
      slug: step,
      disposition: "completed",
      evidence_refs: evidence_refs
    }
  }
  %w[instruction_nonce instruction_hash request_token run_id].each do |key|
    env_key = key.upcase
    receipt[:agentstream_tracker][key.to_sym] = ENV[env_key] if ENV[env_key] && !ENV[env_key].empty?
  end
  text << "```json\n"
  text << JSON.generate(receipt)
  text << "\n```\n"
end

puts JSON.generate(
  session_id: "fake-tracker-session-#{step}",
  type: "assistant",
  message: {
    content: [
      {
        type: "text",
        text: text
      }
    ]
  }
)
