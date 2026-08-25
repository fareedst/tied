#!/usr/bin/env ruby
# [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Fake agent emitting agentstream_tracker receipts.
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

text = +"fake tracker agent processed #{step}\n"
unless ENV["OMIT_TRACKER_RECEIPT"] == "1"
  receipt = {
    agentstream_tracker: {
      schema_version: 1,
      slug: step,
      disposition: "completed",
      evidence_refs: ["working/REQ-TEST/#{step}.md"]
    }
  }
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
