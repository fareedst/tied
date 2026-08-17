#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"

class VocabularyIndexValidator
  INDEX_FILES = %w[routing.md domain-references.md].freeze
  REQUIRED_MARKERS = {
    "canonical title" => /^# .+\(canonical\)/,
    "scope" => /^\*\*Scope:\*\*/,
    "traceability" => /^\*\*Traceability:\*\*/,
    "See also" => /^\*\*See also:\*\*/,
    "alphabetical index" => /^## Alphabetical index$/
  }.freeze

  def initialize(repository_root)
    @repository_root = File.expand_path(repository_root)
    @vocab_root = File.join(@repository_root, "tied", "vocab")
  end

  def validate
    errors = []
    paths = glossary_paths
    errors.concat(validate_index_files)
    errors.concat(validate_glossary_structure(paths))
    errors.concat(validate_catalog_membership(paths))
    errors.concat(validate_links)
    errors.concat(validate_alphabetical_indexes(paths))
    errors
  end

  private

  def glossary_paths
    Dir.glob(File.join(@vocab_root, "*.md")).reject do |path|
      INDEX_FILES.include?(File.basename(path))
    end.sort
  end

  def validate_index_files
    INDEX_FILES.filter_map do |filename|
      path = File.join(@vocab_root, filename)
      "missing vocabulary index: #{relative(path)}" unless File.file?(path)
    end
  end

  def validate_glossary_structure(paths)
    paths.flat_map do |path|
      text = read(path)
      REQUIRED_MARKERS.filter_map do |name, marker|
        "#{relative(path)} is missing #{name}" unless text.match?(marker)
      end
    end
  end

  def validate_catalog_membership(paths)
    routing_paths = table_link_targets(File.join(@vocab_root, "routing.md"), "## Glossary routing table", "## Cross-topic lookup")
    catalog_paths = table_link_targets(File.join(@vocab_root, "domain-references.md"), "## Canonical glossaries", "## Authoring guides")

    paths.flat_map do |path|
      basename = File.basename(path)
      errors = []
      errors << "#{basename} is missing from routing.md" unless routing_paths.include?(basename)
      errors << "#{basename} is missing from domain-references.md" unless catalog_paths.include?(basename)
      errors
    end
  end

  def validate_links
    Dir.glob(File.join(@vocab_root, "*.md")).flat_map do |source|
      read(source).scan(/\]\(([^)]+)\)/).filter_map do |match|
        target = match.first.split("#", 2).first.split("?", 2).first
        next if target.empty? || target.start_with?("#", "//") || target.match?(/\A[a-z][a-z0-9+.-]*:/i)

        resolved = File.expand_path(target, File.dirname(source))
        "#{relative(source)} links to missing path #{target}" unless File.exist?(resolved)
      end
    end
  end

  def validate_alphabetical_indexes(paths)
    paths.flat_map do |path|
      text = read(path)
      body_text, index_text = text.split(/^## Alphabetical index$/, 2)
      index_text ||= ""
      entries = index_text.lines.filter_map do |line|
        next unless line.start_with?("|")

        term = line.split("|", 3)[1].to_s.strip
        next if term.empty? || term.match?(/\A[-: ]+\z/) || term.casecmp("term").zero?

        term.gsub(/[`*]/, "").sub(/\.\z/, "")
      end

      entries.filter_map do |term|
        "#{relative(path)} alphabetical index term is not defined: #{term}" unless body_text.downcase.include?(term.downcase)
      end
    end
  end

  def table_link_targets(path, start_heading, end_heading)
    text = read(path)
    after_start = text.split(start_heading, 2)
    return [] if after_start.length < 2

    section = after_start.last.to_s.split(end_heading, 2).first.to_s
    section.scan(/\]\(([^)#?]+)(?:[#?][^)]*)?\)/).filter_map do |match|
      target = match.first
      next unless target.end_with?(".md")

      File.basename(target)
    end
  end

  def relative(path)
    path.delete_prefix("#{@repository_root}/")
  end

  def read(path)
    File.binread(path).force_encoding(Encoding::UTF_8)
  end
end

if $PROGRAM_NAME == __FILE__
  errors = VocabularyIndexValidator.new(ARGV.fetch(0, Dir.pwd)).validate
  if errors.empty?
    puts "Vocabulary index validation passed."
    exit 0
  end

  warn errors.join("\n")
  exit 1
end
