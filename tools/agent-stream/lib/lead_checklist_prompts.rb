# frozen_string_literal: true

require 'yaml'

# Process: [PROC-AGENT_REQ_CHECKLIST]
# REQ: REQ-ATDD-COMPOS-LEAD_CHECKLIST_YAML
# ARCH: ARCH-ATDD-COMPOS-AGENT_STREAM_CHECKLIST
# IMPL: IMPL-ATDD-COMPOS-LEAD_CHECKLIST_PROMPTS
# Builds one agent message per main checklist step, then optional sub-procedure prompts.
module LeadChecklistPrompts
  module_function

  def step_entries_from_yaml(path, include_sub_procedures: true)
    doc = YAML.load_file(path)
    raise ArgumentError, "invalid checklist YAML: missing 'steps' array" unless doc.is_a?(Hash) && doc['steps'].is_a?(Array)

    token = doc['process_token'] || doc['name'] || 'LEAD+TIED checklist'
    entries = doc['steps'].map do |step|
      id = step['id'] || step[:id] || 'unknown'
      { id: id, message: format_main_step(doc, step, token) }
    end

    if include_sub_procedures && doc['sub_procedures'].is_a?(Array)
      doc['sub_procedures'].each do |sub|
        id = sub['id'] || sub[:id] || 'unknown'
        entries << { id: id, message: format_sub_procedure(doc, sub, token) }
      end
    end

    entries
  end

  def messages_from_yaml(path, include_sub_procedures: true)
    step_entries_from_yaml(path, include_sub_procedures: include_sub_procedures).map { |e| e[:message] }
  end

  def format_main_step(doc, step, token)
    raise ArgumentError, 'step must be a Hash' unless step.is_a?(Hash)

    id = step['id'] || step[:id] || 'unknown'
    title = step['title'] || step[:title] || ''
    goals = step['goals'] || step[:goals]
    tasks = step['tasks'] || step[:tasks]
    outcomes = step['outcomes'] || step[:outcomes]
    refs = step['references'] || step[:references]
    flow = step['flow'] || step[:flow]
    tracking = step['tracking'] || step[:tracking]

    lines = []
    lines << 'Execute this LEAD+TIED agent requirement implementation checklist step in the current workspace.'
    lines << "Process token: #{token}"
    lines << "Checklist: #{doc['name']} (v#{doc['version']})" if doc['name'] || doc['version']
    lines << ''
    lines << "## Step #{id}: #{title}"
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
    if refs.is_a?(Array) && refs.any?
      lines << '### References'
      refs.each do |r|
        lines << if r.is_a?(Hash)
                   "- #{r['document'] || r[:document]} — #{r['provides'] || r[:provides]}"
                 else
                   "- #{r}"
                 end
      end
      lines << ''
    end
    if flow.is_a?(Hash) && flow.any?
      lines << '### Flow'
      lines << "- next: #{flow['next']}" if flow['next']
      lines << "- next_when_all_blocks_done: #{flow['next_when_all_blocks_done']}" if flow['next_when_all_blocks_done']
      Array(flow['branches']).each do |b|
        lines << "- IF #{b['condition']} THEN #{b['action']} (target: #{b['target']})"
      end
      Array(flow['calls']).each { |c| lines << "- CALL #{c}" }
      lines << ''
    end
    if tracking.is_a?(Hash) && tracking['consideration_before_proceeding']
      lines << '### Before proceeding'
      lines << tracking['consideration_before_proceeding'].to_s
      lines << ''
    end
    lines << 'Complete this step now. Follow GOTO/CALL/RETURN semantics from the checklist when they apply.'
    lines.join("\n")
  end

  def format_sub_procedure(doc, sub, token)
    raise ArgumentError, 'sub_procedure must be a Hash' unless sub.is_a?(Hash)

    id = sub['id'] || sub[:id] || 'unknown'
    title = sub['title'] || sub[:title] || ''
    goals = sub['goals'] || sub[:goals]
    tasks = sub['tasks'] || sub[:tasks]
    outcomes = sub['outcomes'] || sub[:outcomes]
    invoked = sub['invoked_by'] || sub[:invoked_by]
    flow = sub['flow'] || sub[:flow]

    lines = []
    lines << 'Sub-procedure (invoke when CALL references this id from a main step).'
    lines << "Process token: #{token}"
    lines << ''
    lines << "## #{id}: #{title}"
    lines << ''
    if invoked.is_a?(Array) && invoked.any?
      lines << '### Invoked by'
      invoked.each { |s| lines << "- #{s}" }
      lines << ''
    end
    lines << '### Goals'
    lines << goals.to_s.strip if goals
    lines << ''
    lines << '### Tasks'
    Array(tasks).each { |t| lines << "- #{t}" }
    lines << ''
    lines << '### Expected outcomes'
    lines << outcomes.to_s.strip if outcomes
    lines << ''
    if flow.is_a?(Hash)
      lines << '### Flow'
      lines << "- return_to: #{flow['return_to']}" if flow['return_to']
      Array(flow['branches']).each do |b|
        lines << "- IF #{b['condition']} THEN #{b['action']} (target: #{b['target']})"
      end
      lines << ''
    end
    lines << 'Run this sub-procedure when a step says CALL this id; then RETURN to the caller.'
    lines.join("\n")
  end
end
