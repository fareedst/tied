#!/usr/bin/env ruby
# [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Fake agent: receipt on each step; one-time goto step-one after first step-two receipt.
require "json"

prompt = ARGV.join("\n")
step =
  if prompt.include?("## Step step-one:")
    "step-one"
  elsif prompt.include?("## Step step-two:")
    "step-two"
  else
    "unknown"
  end

text = +"fake tracker goto agent processed #{step}\n"
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

emit_goto = false
if step == "step-two"
  marker = ENV["GOTO_MARKER"]
  if marker && !marker.empty?
    if File.exist?(marker)
      emit_goto = false
    else
      File.write(marker, "1")
      emit_goto = true
    end
  else
    emit_goto = true
  end
end

if emit_goto
  control = {
    agentstream_control: {
      schema_version: 1,
      action: "goto",
      target: "step-one",
      reason: "loop back to re-run step-one after step-two completion",
      evidence: ["TestTrackerGotoInvalidation"]
    }
  }
  text << "```json\n"
  text << JSON.generate(control)
  text << "\n```\n"
end

puts JSON.generate(
  session_id: "fake-tracker-goto-session-#{step}",
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
