#!/usr/bin/env ruby
# frozen_string_literal: true

require "find"
require "optparse"
require "pathname"
require "set"

require_relative "yaml_semantic_compare"

# Holds command-line configuration for the YAML directory comparison.
class Options
  attr_accessor :left_dir, :right_dir, :include_missing, :extensions, :unordered_arrays

  def initialize
    @include_missing = true
    @extensions = Set.new(%w[.yml .yaml])
    @unordered_arrays = false
  end

  def self.parse(argv)
    options = new

    parser = OptionParser.new do |opts|
      opts.banner = "Usage: ruby compare_yaml_dirs.rb [options] LEFT_DIR RIGHT_DIR"

      opts.on("--[no-]missing", "Report files that exist in only one directory. Default: true") do |value|
        options.include_missing = value
      end

      opts.on("--unordered-arrays", "Treat arrays as unordered multisets. Duplicate values still matter.") do
        options.unordered_arrays = true
      end

      opts.on("--extensions LIST", "Comma-separated extensions. Default: .yml,.yaml") do |value|
        options.extensions = Set.new(
          value.split(",").map { |ext| ext.start_with?(".") ? ext.downcase : ".#{ext.downcase}" }
        )
      end

      opts.on("-h", "--help", "Show this help") do
        puts opts
        exit 0
      end
    end

    parser.parse!(argv)

    unless argv.length == 2
      warn parser
      exit 2
    end

    options.left_dir = File.expand_path(argv[0])
    options.right_dir = File.expand_path(argv[1])

    [options.left_dir, options.right_dir].each do |dir|
      unless Dir.exist?(dir)
        warn "Directory does not exist: #{dir}"
        exit 2
      end
    end

    options
  end
end

# Builds an index of YAML files under a root directory, keyed by relative path.
class YamlFileIndex
  def initialize(root_dir, extensions)
    @root_dir = root_dir
    @extensions = extensions
  end

  def files
    result = {}

    Find.find(@root_dir) do |path|
      next unless File.file?(path)

      ext = File.extname(path).downcase
      next unless @extensions.include?(ext)

      relative_path = Pathname.new(path).relative_path_from(Pathname.new(@root_dir)).to_s
      result[relative_path] = path
    end

    result
  end
end

# Coordinates indexing, YAML loading, comparison, reporting, and exit status.
class YamlDirectoryComparator
  def initialize(options)
    @options = options
    @walker = DifferenceWalker.new(unordered_arrays: @options.unordered_arrays)
  end

  def run
    left_files = YamlFileIndex.new(@options.left_dir, @options.extensions).files
    right_files = YamlFileIndex.new(@options.right_dir, @options.extensions).files

    common_files = (left_files.keys & right_files.keys).sort
    only_left = (left_files.keys - right_files.keys).sort
    only_right = (right_files.keys - left_files.keys).sort

    changed_files = []
    parse_errors = []

    common_files.each do |relative_path|
      left_value = YamlLoader.load(left_files[relative_path])
      right_value = YamlLoader.load(right_files[relative_path])

      differences = @walker.differences(left_value, right_value)
      changed_files << [relative_path, differences] unless differences.empty?
    rescue Psych::Exception, SystemCallError => error
      parse_errors << [relative_path, error]
    end

    print_report(common_files, changed_files, only_left, only_right, parse_errors)

    changed_files.empty? && only_left.empty? && only_right.empty? && parse_errors.empty? ? 0 : 1
  end

  private

  def print_report(common_files, changed_files, only_left, only_right, parse_errors)
    puts "Compared #{common_files.length} matching YAML file(s)."
    puts "Array order ignored." if @options.unordered_arrays

    unless changed_files.empty?
      puts
      puts "Files with differences: #{changed_files.length}"

      changed_files.each do |relative_path, differences|
        puts
        puts relative_path
        differences.each do |difference|
          puts "  - #{difference}"
        end
      end
    end

    if @options.include_missing
      print_missing("Files only in left directory", only_left)
      print_missing("Files only in right directory", only_right)
    end

    unless parse_errors.empty?
      puts
      puts "Files with YAML/read errors: #{parse_errors.length}"

      parse_errors.each do |relative_path, error|
        message = error.message.lines.first.to_s.strip
        puts
        puts relative_path
        puts "  - #{error.class}: #{message}"
      end
    end

    if changed_files.empty? && only_left.empty? && only_right.empty? && parse_errors.empty?
      puts "No differences found."
    end
  end

  def print_missing(title, files)
    return if files.empty?

    puts
    puts "#{title}: #{files.length}"
    files.each { |relative_path| puts "  - #{relative_path}" }
  end
end

exit Options.parse(ARGV).then { |options| YamlDirectoryComparator.new(options).run }
