#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "tmpdir"
require_relative "validate_vocab_index"

class ValidateVocabIndexTest < Minitest::Test
  REPO_ROOT = File.expand_path("..", __dir__)

  def test_repository_vocabulary_indexes_are_consistent
    errors = VocabularyIndexValidator.new(REPO_ROOT).validate

    assert_empty errors, errors.join("\n")
  end

  def test_missing_glossary_is_reported
    Dir.mktmpdir do |root|
      vocab_dir = File.join(root, "tied", "vocab")
      FileUtils.mkdir_p(vocab_dir)
      File.write(File.join(vocab_dir, "routing.md"), routing_index("extra.md"))
      File.write(File.join(vocab_dir, "domain-references.md"), catalog_index("extra.md"))
      File.write(File.join(vocab_dir, "extra.md"), canonical_glossary)

      errors = VocabularyIndexValidator.new(root).validate

      assert errors.any? { |error| error.include?("extra.md") && error.include?("domain-references") }
    end
  end

  def test_alphabetical_entry_must_be_defined_before_the_index
    Dir.mktmpdir do |root|
      vocab_dir = File.join(root, "tied", "vocab")
      FileUtils.mkdir_p(vocab_dir)
      File.write(File.join(vocab_dir, "routing.md"), routing_index("extra.md"))
      File.write(File.join(vocab_dir, "domain-references.md"), catalog_index("extra.md"))
      File.write(
        File.join(vocab_dir, "extra.md"),
        canonical_glossary.sub("extra term | Canonical terms", "missing term | Canonical terms")
      )

      errors = VocabularyIndexValidator.new(root).validate

      assert errors.any? { |error| error.include?("missing term") }
    end
  end

  private

  def routing_index(file)
    <<~MARKDOWN
      # Routing
      | Pri | File | Keywords |
      |---|---|---|
      | 1 | [#{file}](#{file}) | extra |
    MARKDOWN
  end

  def catalog_index(file)
    <<~MARKDOWN
      # Catalog
      | Priority | Document | Scope |
      |---|---|---|
      | 1 | [#{file}](#{file}) | extra |
    MARKDOWN
  end

  def canonical_glossary
    <<~MARKDOWN
      # Extra (canonical)
      **Scope:** Extra vocabulary only.
      **Traceability:** [REQ-EXTRA](../requirements/REQ-EXTRA.yaml)
      **See also:** [`routing.md`](routing.md)
      ## Canonical terms
      **extra term**
      ## Alphabetical index
      | Term | Section |
      |---|---|
      | extra term | Canonical terms |
    MARKDOWN
  end
end
