# frozen_string_literal: true

require 'yaml'

# Process: [PROC-AGENT_REQ_CHECKLIST]
# REQ: REQ-ATDD-COMPOS-LEAD_CHECKLIST_YAML
# ARCH: ARCH-ATDD-COMPOS-AGENT_STREAM_CHECKLIST
# IMPL: IMPL-ATDD-COMPOS-LEAD_CHECKLIST_PROMPTS
# Builds one agent message per main checklist step, then optional sub-procedure prompts.
module LeadChecklistPrompts
  module_function

  CHECKLIST_PLACEHOLDER = /\{\{([A-Za-z0-9_]+)\}\}/

  # Expands {{KEY}} using vars; missing keys leave the token unchanged (matches Go agentstream).
  def expand_placeholders(str, vars)
    return str if vars.nil? || vars.empty?

    str.gsub(CHECKLIST_PLACEHOLDER) do
      key = Regexp.last_match(1)
      vars.fetch(key) { "{{#{key}}}" }
    end
  end

  def validate_strict_placeholders!(message, strict, path, slug)
    return unless strict

    return unless message.match?(CHECKLIST_PLACEHOLDER)

    raise ArgumentError,
          "checklist #{path}: unresolved {{NAME}} placeholder(s) in step #{slug.inspect} (--checklist-var-strict)"
  end

  def step_slug_or_id(step)
    step['slug'] || step[:slug] || step['id'] || step[:id] || 'unknown'
  end

  # When true, this checklist turn is issued without --resume (new agent session), matching Go agentstream
  # Turn.ChainFromPrevious = !agentstream_new_session.
  def chain_from_previous_for_checklist_item(h)
    v = h['agentstream_new_session'] || h[:agentstream_new_session]
    v != true
  end

  def step_entries_from_yaml(path, include_sub_procedures: true, checklist_vars: {}, checklist_var_strict: false)
    doc = YAML.load_file(path)
    raise ArgumentError, "invalid checklist YAML: missing 'steps' array" unless doc.is_a?(Hash) && doc['steps'].is_a?(Array)

    strict = checklist_var_strict || ENV['AGENTSTREAM_CHECKLIST_VAR_STRICT'] == '1'
    vars = checklist_vars || {}

    token = doc['process_token'] || doc['name'] || 'LEAD+TIED checklist'
    entries = doc['steps'].map do |step|
      id = step_slug_or_id(step)
      msg = format_main_step(doc, step, token, vars)
      validate_strict_placeholders!(msg, strict, path, id)
      {
        id: id,
        message: msg,
        chain_from_previous: chain_from_previous_for_checklist_item(step)
      }
    end

    if include_sub_procedures && doc['sub_procedures'].is_a?(Array)
      doc['sub_procedures'].each do |sub|
        id = step_slug_or_id(sub)
        msg = format_sub_procedure(doc, sub, token, vars)
        validate_strict_placeholders!(msg, strict, path, id)
        entries << {
          id: id,
          message: msg,
          chain_from_previous: chain_from_previous_for_checklist_item(sub)
        }
      end
    end

    entries
  end

  def messages_from_yaml(path, include_sub_procedures: true, checklist_vars: {}, checklist_var_strict: false)
    step_entries_from_yaml(path, include_sub_procedures: include_sub_procedures, checklist_vars: checklist_vars,
                                  checklist_var_strict: checklist_var_strict).map { |e| e[:message] }
  end

  def format_main_step(doc, step, token, checklist_vars = {})
    raise ArgumentError, 'step must be a Hash' unless step.is_a?(Hash)

    vars = checklist_vars || {}
    exp = ->(s) { expand_placeholders(s.to_s, vars) }

    id = step_slug_or_id(step)
    title = step['title'] || step[:title] || ''
    goals = step['goals'] || step[:goals]
    preconditions = step['preconditions'] || step[:preconditions]
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
    lines << "## Step #{id}: #{exp.call(title.strip)}"
    lines << ''
    lines << '### Goals'
    lines << exp.call(goals.to_s.strip) if goals
    lines << ''
    if preconditions.is_a?(Array) && preconditions.any?
      lines << '### Preconditions'
      Array(preconditions).each { |p| lines << "- #{exp.call(p)}" }
      lines << ''
    end
    lines << '### Tasks'
    Array(tasks).each { |t| lines << "- #{exp.call(t)}" }
    lines << ''
    lines << '### Expected outcomes'
    lines << exp.call(outcomes.to_s.strip) if outcomes
    lines << ''
    if refs.is_a?(Array) && refs.any?
      lines << '### References'
      refs.each do |r|
        ref_line = if r.is_a?(Hash)
                     "#{r['document'] || r[:document]} — #{r['provides'] || r[:provides]}"
                   else
                     r.to_s
                   end
        lines << "- #{exp.call(ref_line)}"
      end
      lines << ''
    end
    if flow.is_a?(Hash) && flow.any?
      lines << '### Flow'
      lines << "- next: #{flow['next']}" if flow['next']
      lines << "- next_when_all_blocks_done: #{flow['next_when_all_blocks_done']}" if flow['next_when_all_blocks_done']
      Array(flow['branches']).each do |b|
        cond = exp.call(b['condition'].to_s)
        act = exp.call(b['action'].to_s)
        lines << "- IF #{cond} THEN #{act} (target: #{b['target']})"
      end
      Array(flow['calls']).each { |c| lines << "- CALL #{c}" }
      lines << ''
    end
    if tracking.is_a?(Hash) && tracking['consideration_before_proceeding']
      lines << '### Before proceeding'
      lines << exp.call(tracking['consideration_before_proceeding'].to_s)
      lines << ''
    end
    lines << 'Complete this step now. Follow GOTO/CALL/RETURN semantics from the checklist when they apply.'
    lines.join("\n")
  end

  def format_sub_procedure(doc, sub, token, checklist_vars = {})
    raise ArgumentError, 'sub_procedure must be a Hash' unless sub.is_a?(Hash)

    vars = checklist_vars || {}
    exp = ->(s) { expand_placeholders(s.to_s, vars) }

    id = step_slug_or_id(sub)
    title = sub['title'] || sub[:title] || ''
    goals = sub['goals'] || sub[:goals]
    preconditions = sub['preconditions'] || sub[:preconditions]
    tasks = sub['tasks'] || sub[:tasks]
    outcomes = sub['outcomes'] || sub[:outcomes]
    invoked = sub['invoked_by'] || sub[:invoked_by]
    flow = sub['flow'] || sub[:flow]

    lines = []
    lines << 'Sub-procedure (invoke when CALL references this id from a main step).'
    lines << "Process token: #{token}"
    lines << ''
    lines << "## #{id}: #{exp.call(title.strip)}"
    lines << ''
    if invoked.is_a?(Array) && invoked.any?
      lines << '### Invoked by'
      invoked.each { |s| lines << "- #{exp.call(s)}" }
      lines << ''
    end
    lines << '### Goals'
    lines << exp.call(goals.to_s.strip) if goals
    lines << ''
    if preconditions.is_a?(Array) && preconditions.any?
      lines << '### Preconditions'
      Array(preconditions).each { |p| lines << "- #{exp.call(p)}" }
      lines << ''
    end
    lines << '### Tasks'
    Array(tasks).each { |t| lines << "- #{exp.call(t)}" }
    lines << ''
    lines << '### Expected outcomes'
    lines << exp.call(outcomes.to_s.strip) if outcomes
    lines << ''
    if flow.is_a?(Hash)
      lines << '### Flow'
      lines << "- return_to: #{flow['return_to']}" if flow['return_to']
      Array(flow['branches']).each do |b|
        cond = exp.call(b['condition'].to_s)
        act = exp.call(b['action'].to_s)
        lines << "- IF #{cond} THEN #{act} (target: #{b['target']})"
      end
      lines << ''
    end
    lines << 'Run this sub-procedure when a step says CALL this id; then RETURN to the caller.'
    lines.join("\n")
  end
end
