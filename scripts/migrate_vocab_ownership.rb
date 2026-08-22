#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_STRUCTURE] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_SETUP] [REQ-TIED_VOCABULARY_OWNERSHIP] [PROC-VOCABULARY_INDEX]
# How: Report legacy vocabulary ownership conflicts before moving only exact
# methodology glossaries into the refreshable client methodology snapshot.

require "fileutils"
require "optparse"

options = {
  apply: false,
  fail_on_review: false
}

OptionParser.new do |parser|
  parser.banner = "Usage: migrate_vocab_ownership.rb [options] CLIENT_PROJECT"
  parser.on("--apply", "Move exact methodology glossaries into tied/methodology/vocab") do
    options[:apply] = true
  end
  parser.on("--fail-on-review", "Exit 2 when files require human review") do
    options[:fail_on_review] = true
  end
end.parse!

client_root = ARGV.shift
unless client_root && ARGV.empty?
  warn "A single client project path is required."
  exit 1
end

source_root = File.expand_path("..", __dir__)
source_vocab = File.join(source_root, "tied", "vocab")
client_vocab = File.join(File.expand_path(client_root), "tied", "vocab")
methodology_vocab = File.join(File.expand_path(client_root), "tied", "methodology", "vocab")
source_only = ["prompt-composer.md"].freeze
mixed_indexes = %w[routing.md domain-references.md].freeze

unless File.directory?(client_vocab)
  warn "Client vocabulary directory does not exist: #{client_vocab}"
  exit 1
end

canonical = Dir.glob(File.join(source_vocab, "*.md")).filter_map do |path|
  basename = File.basename(path)
  basename unless source_only.include?(basename)
end.to_h { |basename| [basename, File.join(source_vocab, basename)] }

reviews = []
moved = []
preserved = []

Dir.glob(File.join(client_vocab, "*.md")).sort.each do |client_path|
  basename = File.basename(client_path)
  unless canonical.key?(basename)
    preserved << basename
    next
  end

  if mixed_indexes.include?(basename)
    reviews << "#{basename}: routing/catalog handoff is mixed by definition; resolve links manually"
    preserved << basename
    next
  end

  source_content = File.binread(canonical.fetch(basename))
  client_content = File.binread(client_path)
  if source_content != client_content
    reviews << "#{basename}: content differs from TIED methodology glossary; review before moving"
    preserved << basename
    next
  end

  target_path = File.join(methodology_vocab, basename)
  if File.exist?(target_path)
    if File.binread(target_path) == client_content
      puts "SKIP: #{basename} already exists in methodology snapshot; preserving client copy."
    else
      reviews << "#{basename}: methodology destination already exists with different content"
    end
    preserved << basename
    next
  end

  if options[:apply]
    FileUtils.mkdir_p(methodology_vocab)
    FileUtils.mv(client_path, target_path)
    puts "MOVE: #{basename} -> tied/methodology/vocab/#{basename}"
    moved << basename
  else
    puts "CANDIDATE: #{basename} -> tied/methodology/vocab/#{basename}"
    moved << basename
  end
end

puts "SUMMARY: moved=#{moved.length} preserved=#{preserved.length} review=#{reviews.length} apply=#{options[:apply]}"
reviews.each { |review| puts "REVIEW: #{review}" }

if reviews.any? && options[:fail_on_review]
  exit 2
end
