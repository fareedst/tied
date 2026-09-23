#!/usr/bin/env ruby
# REQ-GOAGENT-CHECKLIST-CONTROL: fake stream-json agent that emits the control
# payload used when old tests fail after recent GREEN changes.
require "json"

prompt = ARGV.join("\n")
step =
  if prompt.include?("## Step trigger-special:")
    "trigger-special"
  elsif prompt.include?("## Step normal-next:")
    "normal-next"
  elsif prompt.include?("## Step rerouted-next:")
    "rerouted-next"
  else
    "unknown"
  end

text = +"fake agent processed #{step}\n"
if step == "trigger-special"
  control = {
    agentstream_control: {
      schema_version: 1,
      action: "goto",
      target: "rerouted-next",
      reason: "SPECIAL: focused RED test passes, but old tests fail after recent changes.",
      evidence: ["fake old test failure: TestOldBehavior"]
    }
  }
  text << "```json\n"
  text << JSON.generate(control)
  text << "\n```\n"
end

puts JSON.generate(
  session_id: "fake-session-#{step}",
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
