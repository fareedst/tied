# frozen_string_literal: true

require 'yaml'

module TddLoopPrompts
  module_function

  def step_entries_from_yaml(path)
    doc = YAML.load_file(path)
    raise ArgumentError, "invalid TDD YAML: missing 'steps' array" unless doc.is_a?(Hash) && doc['steps'].is_a?(Array)

    token = doc['process_token'] || doc['name'] || 'TDD loop'
    doc['steps'].map do |step|
      id = step['id'] || step[:id] || 'unknown'
      { id: id, message: format_step(doc, step, token) }
    end
  end

  def messages_from_yaml(path)
    step_entries_from_yaml(path).map { |e| e[:message] }
  end

  def format_step(doc, step, token)
    raise ArgumentError, 'step must be a Hash' unless step.is_a?(Hash)

    id = step['id'] || step[:id] || 'unknown'
    title = step['title'] || step[:title] || ''
    stage = step['stage'] || step[:stage]
    goals = step['goals'] || step[:goals]
    tasks = step['tasks'] || step[:tasks]
    outcomes = step['outcomes'] || step[:outcomes]

    lines = []
    lines << "Follow the TDD development loop for this workspace."
    lines << "Process token: #{token}"
    lines << "Document: #{doc['name']} (#{doc['version']})" if doc['name'] || doc['version']
    lines << ''
    lines << "## Step #{id}: #{title}"
    lines << "Stage: #{stage}" if stage
    lines << ''
    lines << '### Goals'
    lines << goals.to_s.strip if goals
    lines << ''
    lines << '### Tasks'
    Array(tasks).each { |t| lines << "- #{t}" }
    lines << ''
    lines << '### Expected outcomes'
    lines << outcomes.to_s.strip if outcomes
    lines << ''
    lines << 'Execute this step now. Do not skip checklist items unless the repo state already satisfies them.'
    lines.join("\n")
  end
end
