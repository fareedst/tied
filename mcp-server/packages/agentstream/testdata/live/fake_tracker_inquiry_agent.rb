#!/usr/bin/env ruby
# [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Fake agent for inquiry sub-turn subprocess composition.
require "json"

def inquiry_artifact_refs(token, phase)
  base = "working/#{token}/adversarial-inquiry/phase-#{phase}"
  [
    "#{base}/obligation-report.json",
    "#{base}/finding-ledger.jsonl",
    "#{base}/gate-result.json",
    "#{base}/evidence-provenance.json"
  ]
end

prompt = ARGV.join("\n")
step =
  if prompt.include?("## Step inquiry-caller:")
    "inquiry-caller"
  elsif prompt.include?("## sub-adversarial-inquiry-pass:")
    "sub-adversarial-inquiry-pass"
  else
    "unknown"
  end

text = +"fake inquiry agent processed #{step}\n"

unless ENV["OMIT_TRACKER_RECEIPT"] == "1"
  token = ENV["REQUEST_TOKEN"] || "REQ-INQUIRY-COMPOSITION"
  evidence_refs =
    if step == "sub-adversarial-inquiry-pass"
      inquiry_artifact_refs(token, "pre_implementation")
    elsif ENV["EVIDENCE_REFS"] && !ENV["EVIDENCE_REFS"].empty?
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

  if step == "sub-adversarial-inquiry-pass"
    inquiry_receipt = {
      success: true,
      phase: "pre_implementation",
      run_id: ENV["RUN_ID"],
      request_token: token
    }
    text << "```json\n"
    text << JSON.generate(tied_adversarial_inquiry_run: inquiry_receipt)
    text << "\n```\n"
  end

  text << "```json\n"
  text << JSON.generate(receipt)
  text << "\n```\n"
end

puts JSON.generate(
  session_id: "fake-inquiry-session-#{step}",
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
