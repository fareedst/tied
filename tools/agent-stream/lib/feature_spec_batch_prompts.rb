# frozen_string_literal: true

require 'yaml'

# REQ: REQ-ATDD-COMPOS-AGENT_STREAM_FEATURE_SPEC_BATCH
# ARCH: ARCH-ATDD-COMPOS-FEATURE_SPEC_BATCH_PROMPTS
# IMPL: IMPL-ATDD-COMPOS-FEATURE_SPEC_BATCH_PROMPTS
module FeatureSpecBatchPrompts
  module_function

  # Parses CLI value for --feature-spec-batch-order: single number or inclusive "low-high" range.
  def order_filter_from_arg(str)
    s = str.to_s.strip
    raise ArgumentError, 'missing value for --feature-spec-batch-order' if s.empty?

    if (m = s.match(/\A(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\z/))
      low = m[1].to_f
      high = m[2].to_f
      raise ArgumentError, "--feature-spec-batch-order range must have low <= high (got #{s.inspect})" if low > high

      low..high
    elsif /\A-?\d+(?:\.\d+)?\z/.match?(s)
      Float(s)
    else
      raise ArgumentError, "invalid --feature-spec-batch-order value: #{str.inspect} (expected N or N-M)"
    end
  end

  def records_from_yaml(path, order_filter: nil)
    doc = YAML.load_file(path)
    records = normalize_root(doc)
    raise ArgumentError, "invalid feature-spec batch YAML: expected a non-empty list of records in #{path}" if records.empty?

    records.each_with_index do |rec, i|
      raise ArgumentError, "invalid feature-spec batch YAML: item #{i} must be a Hash" unless rec.is_a?(Hash)
    end

    sorted = sort_records(records)
    select_records_by_order(sorted, order_filter, path)
  end

  def messages_from_yaml(path, order_filter: nil)
    records_from_yaml(path, order_filter: order_filter).map { |rec| message_for_record(rec) }
  end

  def message_for_record(record)
    name = record['feature_name'] || record[:feature_name]
    goal = record['goal'] || record[:goal]
    raise ArgumentError, 'feature spec record requires feature_name' if name.nil? || name.to_s.strip.empty?
    raise ArgumentError, 'feature spec record requires goal' if goal.nil? || goal.to_s.strip.empty?

    order = record['order'] || record[:order]
    lines = []
    if order.nil?
      lines << "# #{name}"
    else
      lines << "# [#{order}] #{name}"
    end
    lines << ''
    lines << '## Goal'
    lines << goal.to_s.strip
    lines << ''

    behavior = record['behavior'] || record[:behavior]
    if behavior && !behavior.to_s.strip.empty?
      lines << '## Behavior'
      lines << behavior.to_s.strip
      lines << ''
    end

    append_section(lines, '## Rules', list_items(record['rules'] || record[:rules]))
    append_examples(lines, record['examples'] || record[:examples])
    append_section(lines, '## Boundary conditions', list_items(record['boundary_conditions'] || record[:boundary_conditions]))

    oos = record['out_of_scope'] || record[:out_of_scope]
    if oos && !oos.to_s.strip.empty?
      lines << '## Out of scope'
      lines << oos.to_s.strip
      lines << ''
    end

    lines.join("\n").strip
  end

  def print_preview(path, out: $stdout, order_filter: nil)
    msgs = messages_from_yaml(path, order_filter: order_filter)
    n = msgs.size
    msgs.each_with_index do |msg, i|
      out.puts "=== prompt #{i + 1}/#{n} ==="
      out.puts msg
      out.puts '---' if i < n - 1
    end
  end

  def normalize_root(doc)
    case doc
    when Array
      doc
    when Hash
      feats = doc['features'] || doc[:features]
      return feats if feats.is_a?(Array)

      raise ArgumentError, 'invalid feature-spec batch YAML: root must be an array or a mapping with key "features"'
    else
      raise ArgumentError, 'invalid feature-spec batch YAML: root must be an array or a mapping with key "features"'
    end
  end

  def sort_records(records)
    return records if records.empty?

    has_any_order = records.any? { |r| !(r['order'].nil? && r[:order].nil?) }
    return records unless has_any_order

    records.each_with_index.sort_by do |rec, idx|
      o = rec['order'] || rec[:order]
      key_order = o.nil? ? Float::INFINITY : o.to_f
      [key_order, idx]
    end.map(&:first)
  end

  def select_records_by_order(records, order_filter, path)
    return records if order_filter.nil?

    selected = records.select do |rec|
      o = rec['order'] || rec[:order]
      next false if o.nil?

      v = o.to_f
      case order_filter
      when Range
        order_filter.cover?(v)
      when Numeric
        v == order_filter.to_f
      else
        raise ArgumentError, "internal: unsupported order_filter #{order_filter.class}"
      end
    end

    if selected.empty?
      raise ArgumentError,
            "no feature-spec batch records matched --feature-spec-batch-order in #{path}"
    end

    selected
  end
  private_class_method :select_records_by_order

  def list_items(value)
    return [] if value.nil?

    case value
    when Array
      value.map(&:to_s).map(&:strip).reject(&:empty?)
    when String
      s = value.strip
      s.empty? ? [] : [s]
    else
      [value.to_s.strip].reject(&:empty?)
    end
  end

  def append_section(lines, heading, items)
    return if items.empty?

    lines << heading
    items.each { |item| lines << "- #{item}" }
    lines << ''
  end

  def append_examples(lines, examples)
    return if examples.nil?

    arr = examples.is_a?(Array) ? examples : [examples]
    return if arr.empty?

    lines << '## Examples'
    arr.each_with_index do |ex, i|
      unless ex.is_a?(Hash)
        lines << "### Example #{i + 1}"
        lines << ex.to_s.strip
        lines << ''
        next
      end

      g = ex['given'] || ex[:given]
      w = ex['when'] || ex[:when]
      t = ex['then'] || ex[:then]
      lines << "### Example #{i + 1}"
      lines << "- Given: #{g}" if g && !g.to_s.strip.empty?
      lines << "- When: #{w}" if w && !w.to_s.strip.empty?
      lines << "- Then: #{t}" if t && !t.to_s.strip.empty?
      lines << ''
    end
  end
end
