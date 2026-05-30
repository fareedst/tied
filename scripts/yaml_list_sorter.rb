#!/usr/bin/env ruby
# frozen_string_literal: true

# [PROC-YAML_EDIT_LOOP] [REQ-TIED_SETUP]
# How: Sort qualifying list groups (3+ consecutive same-indent "- " lines) alphabetically in place.
#
# Sorts YAML list groups in one or more files.
#
# A group is 3 or more consecutive lines where each line has the same
# indentation and begins with "- " immediately after that indentation.
#
# Each qualifying group is sorted alphabetically in place.
class YamlListSorter
  Result = Struct.new(:file, :groups_found, :groups_modified, keyword_init: true)

  LIST_ITEM_PATTERN = /^([ \t]*)- /

  def initialize(path)
    @path = path
  end

  def run
    lines = File.readlines(@path, chomp: false, encoding: "UTF-8")

    groups_found = 0
    groups_modified = 0
    output = []
    index = 0

    while index < lines.length
      match = lines[index].match(LIST_ITEM_PATTERN)

      unless match
        output << lines[index]
        index += 1
        next
      end

      indentation = match[1]
      group = []

      while index < lines.length
        current_match = lines[index].match(LIST_ITEM_PATTERN)
        break unless current_match && current_match[1] == indentation

        group << lines[index]
        index += 1
      end

      if group.length >= 3
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

    File.write(@path, output.join, encoding: "UTF-8") if groups_modified.positive?

    Result.new(
      file: @path,
      groups_found: groups_found,
      groups_modified: groups_modified
    )
  end
end

# Command-line runner for YamlListSorter.
class SortYamlListsCommand
  def initialize(argv)
    @argv = argv
  end

  def run
    if @argv.empty?
      warn "Usage: #{File.basename($PROGRAM_NAME)} FILE [FILE ...]"
      return 2
    end

    exit_code = 0

    @argv.each do |path|
      unless File.file?(path)
        warn "#{path}: not a regular file"
        exit_code = 1
        next
      end

      result = YamlListSorter.new(path).run

      puts format(
        "%<file>s: groups found=%<found>d, groups modified=%<modified>d",
        file: result.file,
        found: result.groups_found,
        modified: result.groups_modified
      )
    rescue StandardError => e
      warn "#{path}: #{e.class}: #{e.message}"
      exit_code = 1
    end

    exit_code
  end
end

exit SortYamlListsCommand.new(ARGV).run if $PROGRAM_NAME == __FILE__
