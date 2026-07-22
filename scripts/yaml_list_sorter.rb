#!/usr/bin/env ruby
# frozen_string_literal: true

require "optparse"

require_relative "yaml_semantic_compare"

# Raised when post-sort semantic comparison fails or sorted content does not parse.
class SemanticSortValidationError < StandardError
  attr_reader :differences

  def initialize(message, differences: [])
    @differences = differences
    super(message)
  end
end

# [PROC-YAML_EDIT_LOOP] [REQ-TIED_SETUP]
# How: Sort qualifying list groups (2+ consecutive same-indent "- " lines) alphabetically in place;
# optional --sort-keys recursively sorts sibling map keys at every indent level.
# Block-scalar bodies (| or >) and multiline quoted scalars (' or ") are opaque: string content
# is never sorted as keys or lists.
#
# Sorts YAML list groups in one or more files.
#
# A qualifying list group is 2 or more consecutive lines where each line has the same
# indentation and begins with "- " immediately after that indentation.
#
# Each qualifying group is sorted alphabetically in place.
class YamlListSorter
  Result = Struct.new(
    :file,
    :groups_found,
    :groups_modified,
    :maps_found,
    :maps_modified,
    :sort_keys,
    :validated,
    keyword_init: true
  )

  LIST_ITEM_PATTERN = /^([ \t]*)- /
  KEY_LINE_PATTERN = /^([ \t]*)([^\s\-#][^:]*):\s?(.*)$/
  BLOCK_SCALAR_VALUE = /\A(?:\||>)[+-]?(?:\s+#.*)?\z/

  def initialize(path, sort_keys: false)
    @path = path
    @sort_keys = sort_keys
  end

  def run
    original = File.read(@path, encoding: "UTF-8")
    lines = normalize_line_endings(File.readlines(@path, chomp: false, encoding: "UTF-8"))

    groups_found = 0
    groups_modified = 0
    maps_found = 0
    maps_modified = 0

    if @sort_keys
      opaque = block_scalar_regions(lines)
      lines, maps_found, maps_modified = sort_map_keys(lines, 0, lines.length, opaque)
    end

    opaque = block_scalar_regions(lines)
    lines, groups_found, groups_modified = sort_list_groups(lines, opaque)

    sorted = lines.join
    validated = false

    if sorted != original
      validate_sorted_content!(original, sorted, groups_modified: groups_modified)
      validated = true
      File.write(@path, sorted, encoding: "UTF-8")
    end

    Result.new(
      file: @path,
      groups_found: groups_found,
      groups_modified: groups_modified,
      maps_found: maps_found,
      maps_modified: maps_modified,
      sort_keys: @sort_keys,
      validated: validated
    )
  end

  def validate_sorted_content!(original_content, sorted_content, groups_modified:)
    original_value = load_yaml_value(original_content, @path, label: "original")
    sorted_value = load_yaml_value(sorted_content, @path, label: "sorted")

    compare_result = YamlSemanticCompare.compare(
      original_value,
      sorted_value,
      unordered_arrays: groups_modified.positive?
    )

    return if compare_result.ok

    raise SemanticSortValidationError.new(
      "semantic validation failed after sort",
      differences: compare_result.differences
    )
  end

  def load_yaml_value(content, filename, label:)
    YamlLoader.load_content(content, filename: filename)
  rescue Psych::Exception => e
    raise SemanticSortValidationError.new(
      "#{label} content failed to parse: #{e.class}: #{e.message.lines.first.to_s.strip}"
    )
  end

  def sort_list_groups(lines, opaque_regions = block_scalar_regions(lines))
    groups_found = 0
    groups_modified = 0
    output = []
    index = 0

    while index < lines.length
      region = opaque_region_containing(opaque_regions, index)
      if region
        output.concat(lines[index...region.end])
        index = region.end
        next
      end

      match = lines[index].match(LIST_ITEM_PATTERN)

      unless match
        output << lines[index]
        index += 1
        next
      end

      indentation = match[1]
      group = []

      while index < lines.length
        region = opaque_region_containing(opaque_regions, index)
        break if region

        current_match = lines[index].match(LIST_ITEM_PATTERN)
        break unless current_match && current_match[1] == indentation

        group << lines[index]
        index += 1
      end

      if group.length >= 2
        groups_found += 1

        sorted_group = group.sort_by { |line| line.sub(/^#{Regexp.escape(indentation)}- /, "").downcase }

        if sorted_group != group
          groups_modified += 1
          output.concat(sorted_group)
        else
          output.concat(group)
        end
      else
        output.concat(group)
      end
    end

    [output, groups_found, groups_modified]
  end

  def sort_map_keys(lines, start_idx, end_idx, opaque_regions)
    sort_range(lines, start_idx, end_idx, opaque_regions)
  end

  def block_scalar_regions(lines)
    regions = []
    walk_for_block_scalars(lines, 0, lines.length, regions)
    regions
  end

  private

  def normalize_line_endings(lines)
    lines.map { |line| line.end_with?("\n") ? line : "#{line}\n" }
  end

  def walk_for_block_scalars(lines, start_idx, end_idx, regions)
    index = start_idx

    while index < end_idx
      line = lines[index]

      if blank_or_comment?(line)
        index += 1
        next
      end

      region = opaque_region_containing(regions, index)
      if region
        index = region.end
        next
      end

      list_match = line.match(LIST_ITEM_PATTERN)
      if list_match
        indent = list_match[1]
        group_end = index + 1
        while group_end < end_idx
          current_match = lines[group_end].match(LIST_ITEM_PATTERN)
          break unless current_match && current_match[1] == indent

          group_end += 1
        end

        item_index = index
        while item_index < group_end
          item_end = collect_list_item_end(lines, item_index, group_end, indent)
          walk_for_block_scalars(lines, item_index + 1, item_end, regions)
          item_index = item_end
        end

        index = group_end
        next
      end

      key_match = line.match(KEY_LINE_PATTERN)
      unless key_match
        index += 1
        next
      end

      indent = key_match[1]
      if block_scalar_value?(key_match[3]) || multiline_quoted_scalar_value?(key_match[3])
        _block, next_index = collect_key_block(lines, index, end_idx, indent)
        regions << (index + 1...next_index) if next_index > index + 1
        index = next_index
      else
        _block, next_index = collect_key_block(lines, index, end_idx, indent)
        walk_for_block_scalars(lines, index + 1, next_index, regions) if next_index > index + 1
        index = next_index
      end
    end
  end

  def collect_list_item_end(lines, item_start, group_end, list_indent)
    item_end = item_start + 1

    while item_end < group_end
      line = lines[item_end]

      if blank_or_comment?(line)
        item_end += 1
        next
      end

      list_match = line.match(LIST_ITEM_PATTERN)
      break if list_match && list_match[1] == list_indent

      current_indent = line_indent(line)
      break if current_indent.length <= list_indent.length

      item_end += 1
    end

    item_end
  end

  def sort_range(lines, start_idx, end_idx, opaque_regions)
    output = []
    maps_found = 0
    maps_modified = 0
    index = start_idx

    while index < end_idx
      region = opaque_region_containing(opaque_regions, index)
      if region
        output.concat(lines[index...region.end])
        index = region.end
        next
      end

      line = lines[index]

      if blank_or_comment?(line)
        output << line
        index += 1
        next
      end

      list_match = line.match(LIST_ITEM_PATTERN)
      if list_match
        indent = list_match[1]
        group_end = index + 1
        while group_end < end_idx
          current_match = lines[group_end].match(LIST_ITEM_PATTERN)
          break unless current_match && current_match[1] == indent

          group_end += 1
        end

        output.concat(lines[index...group_end])
        index = group_end
        next
      end

      key_match = line.match(KEY_LINE_PATTERN)
      unless key_match
        output << line
        index += 1
        next
      end

      indent = key_match[1]
      blocks = []

      while index < end_idx
        region = opaque_region_containing(opaque_regions, index)
        break if region

        current_match = lines[index].match(KEY_LINE_PATTERN)
        break unless current_match && current_match[1] == indent

        block, next_index = collect_key_block(lines, index, end_idx, indent)
        processed_block, block_maps_found, block_maps_modified =
          process_key_block(lines, index, next_index, opaque_regions)
        maps_found += block_maps_found
        maps_modified += block_maps_modified
        blocks << processed_block
        index = next_index
      end

      if blocks.length >= 2
        maps_found += 1
        sorted_blocks = blocks.sort_by { |block| extract_key_name(block[0]).downcase }
        if sorted_blocks != blocks
          maps_modified += 1
          sorted_blocks.each { |block| output.concat(block) }
        else
          blocks.each { |block| output.concat(block) }
        end
      else
        blocks.each { |block| output.concat(block) }
      end
    end

    [output, maps_found, maps_modified]
  end

  def process_key_block(lines, block_start, block_end, opaque_regions)
    return [lines[block_start...block_end], 0, 0] if block_end <= block_start + 1

    value_part = extract_value_part(lines[block_start])
    return [lines[block_start...block_end], 0, 0] if block_scalar_value?(value_part)
    return [lines[block_start...block_end], 0, 0] if multiline_quoted_scalar_value?(value_part)

    sorted_body, maps_found, maps_modified =
      sort_range(lines, block_start + 1, block_end, opaque_regions)
    new_block = [lines[block_start], *sorted_body]

    [new_block, maps_found, maps_modified]
  end

  def collect_key_block(lines, index, end_idx, indent)
    block = [lines[index]]
    index += 1

    if multiline_quoted_scalar_key?(block[0])
      delimiter = quoted_scalar_delimiter(extract_value_part(block[0]))
      while index < end_idx
        line = lines[index]
        block << line
        index += 1
        break if quoted_scalar_line_closes?(line, delimiter)
      end

      return [block, index]
    end

    while index < end_idx
      line = lines[index]

      if blank_or_comment?(line)
        block << line
        index += 1
        next
      end

      current_indent = line_indent(line)
      if current_indent.length > indent.length
        block << line
        index += 1
        next
      end

      key_match = line.match(KEY_LINE_PATTERN)
      break if key_match && key_match[1] == indent

      list_match = line.match(LIST_ITEM_PATTERN)
      if list_match && list_match[1] == indent
        if implicit_block_value_key?(block[0])
          block << line
          index += 1
          next
        end

        break
      end

      break
    end

    [block, index]
  end

  def block_scalar_value?(value_part)
    value_part.match?(BLOCK_SCALAR_VALUE)
  end

  def implicit_block_value_key?(key_line)
    value_part = extract_value_part(key_line)
    return false if block_scalar_value?(value_part)
    return false if multiline_quoted_scalar_value?(value_part)

    value_part.strip.empty?
  end

  def multiline_quoted_scalar_key?(key_line)
    multiline_quoted_scalar_value?(extract_value_part(key_line))
  end

  def multiline_quoted_scalar_value?(value_part)
    delimiter = quoted_scalar_delimiter(value_part)
    return false unless delimiter

    unescaped_quote_count(value_part, delimiter).odd?
  end

  def quoted_scalar_delimiter(value_part)
    stripped = value_part.lstrip
    return '"' if stripped.start_with?('"')
    return "'" if stripped.start_with?("'")

    nil
  end

  def quoted_scalar_line_closes?(line, delimiter)
    stripped = line.rstrip
    return false unless stripped.end_with?(delimiter)

    unescaped_quote_count(stripped, delimiter).odd?
  end

  def unescaped_quote_count(str, delimiter)
    count = 0
    i = 0
    while i < str.length
      if delimiter == '"' && str[i] == "\\"
        i += 2
        next
      end
      if str[i] == delimiter
        if delimiter == "'" && i + 1 < str.length && str[i + 1] == delimiter
          i += 2
          next
        end
        count += 1
      end
      i += 1
    end
    count
  end

  def opaque_region_containing(regions, index)
    regions.find { |region| region.cover?(index) }
  end

  def blank_or_comment?(line)
    stripped = line.strip
    stripped.empty? || stripped.start_with?("#")
  end

  def line_indent(line)
    line[/\A[ \t]*/]
  end

  def extract_key_name(key_line)
    key_line.match(KEY_LINE_PATTERN)[2]
  end

  def extract_value_part(key_line)
    key_line.match(KEY_LINE_PATTERN)[3]
  end
end

# Command-line runner for YamlListSorter.
class SortYamlListsCommand
  def initialize(argv)
    @argv = argv
  end

  def run
    $stdout.sync = true
    options = { sort_keys: false }
    parser = OptionParser.new do |opts|
      opts.banner = "Usage: #{File.basename($PROGRAM_NAME)} [options] FILE [FILE ...]"
      opts.on("--sort-keys", "Also sort sibling map keys at every indent level") do
        options[:sort_keys] = true
      end
    end

    paths = parser.parse(@argv)

    if paths.empty?
      warn parser.help
      return 2
    end

    exit_code = 0
    processed = 0
    failures = []

    paths.each do |path|
      unless File.file?(path)
        reason = "not a regular file"
        warn "#{path}: #{reason}"
        failures << { path: path, reason: reason }
        exit_code = 1
        next
      end

      processed += 1

      begin
        result = YamlListSorter.new(path, sort_keys: options[:sort_keys]).run

        if result.validated
          puts format("%<file>s: semantic validation passed", file: result.file)
        end

        if result.sort_keys
          puts format(
            "%<file>s: groups found=%<found>d, groups modified=%<modified>d, " \
            "maps found=%<maps_found>d, maps modified=%<maps_modified>d",
            file: result.file,
            found: result.groups_found,
            modified: result.groups_modified,
            maps_found: result.maps_found,
            maps_modified: result.maps_modified
          )
        else
          puts format(
            "%<file>s: groups found=%<found>d, groups modified=%<modified>d",
            file: result.file,
            found: result.groups_found,
            modified: result.groups_modified
          )
        end
      rescue SemanticSortValidationError => e
        diff_count = e.differences.length
        reason =
          if diff_count.positive?
            "semantic validation failed (#{diff_count} difference#{diff_count == 1 ? '' : 's'}; file not modified)"
          else
            "semantic validation failed: #{e.message} (file not modified)"
          end
        warn "#{path}: #{reason}:"
        if e.differences.empty?
          warn "  - #{e.message}"
        else
          e.differences.each { |difference| warn "  - #{difference}" }
        end
        failures << { path: path, reason: reason }
        exit_code = 1
      rescue StandardError => e
        reason = "#{e.class}: #{e.message}"
        warn "#{path}: #{reason}"
        failures << { path: path, reason: reason }
        exit_code = 1
      end
    end

    print_summary(processed: processed, total: paths.length, failures: failures, exit_code: exit_code)

    exit_code
  end

  private

  def print_summary(processed:, total:, failures:, exit_code:)
    return if exit_code.zero?

    warn ""
    warn format(
      "yaml_list_sorter: %<processed>d of %<total>d file(s) processed; %<failed>d failed (exit %<exit>d):",
      processed: processed,
      total: total,
      failed: failures.length,
      exit: exit_code
    )
    failures.each do |failure|
      warn "  - #{failure[:path]}: #{failure[:reason]}"
    end
    warn "See detailed difference lines above for each failed file."
  end
end

exit SortYamlListsCommand.new(ARGV).run if $PROGRAM_NAME == __FILE__
