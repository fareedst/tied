#!/usr/bin/env ruby
# [REQ-TIED_JEV_DECISION_COPROCESSOR] Fake stream-json agent emitting a Shell tool proposal line.
require "json"

prompt = ARGV.join("\n")
step = prompt.include?("blocked") ? "blocked" : "allowed"

puts JSON.generate(
  type: "agentstream_tool_proposal",
  tool: "Shell",
  command: "echo #{step}-shell",
)

puts JSON.generate(
  session_id: "fake-jev-shell-#{step}",
  type: "assistant",
  message: {
    content: [
      { type: "text", text: "fake jev shell agent #{step}\n" },
    ],
  },
)
