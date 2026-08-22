#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "tmpdir"
require_relative "validate_vocab_index"

# [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
# How: Exercise independent methodology/client vocabulary validation and legacy compatibility behavior.
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

  def test_layered_methodology_and_client_indexes_are_validated_independently
    Dir.mktmpdir do |root|
      methodology = File.join(root, "tied", "methodology", "vocab")
      client = File.join(root, "tied", "vocab")
      FileUtils.mkdir_p(methodology)
      FileUtils.mkdir_p(client)

      File.write(File.join(methodology, "routing.md"), layered_routing("method.md", "Glossary"))
      File.write(File.join(methodology, "domain-references.md"), layered_catalog("method.md", "Canonical"))
      File.write(File.join(methodology, "method.md"), canonical_glossary("method term"))

      File.write(File.join(client, "routing.md"), client_routing)
      File.write(File.join(client, "domain-references.md"), client_catalog)
      File.write(File.join(client, "client.md"), canonical_glossary("client term"))

      errors = VocabularyIndexValidator.new(root).validate

      assert_empty errors, errors.join("\n")
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

  def canonical_glossary(term = "extra term")
    <<~MARKDOWN
      # Extra (canonical)
      **Scope:** Extra vocabulary only.
      **Traceability:** REQ-EXTRA
      **See also:** [`routing.md`](routing.md)
      ## Canonical terms
      **#{term}**
      ## Alphabetical index
      | Term | Section |
      |---|---|
      | #{term} | Canonical terms |
    MARKDOWN
  end

  def layered_routing(file, heading)
    <<~MARKDOWN
      # Routing
      ## Glossary routing table
      | Pri | File | Keywords |
      |---|---|---|
      | 1 | [#{file}](#{file}) | #{heading.downcase} |
      ## Cross-topic lookup
    MARKDOWN
  end

  def layered_catalog(file, heading)
    <<~MARKDOWN
      # Catalog
      ## Canonical glossaries
      | Priority | Document | Scope |
      |---|---|---|
      | 1 | [#{file}](#{file}) | #{heading.downcase} |
      ## Authoring guides
    MARKDOWN
  end

  def client_routing
    <<~MARKDOWN
      # Client vocabulary routing index
      [Methodology route](../methodology/vocab/routing.md)
      ## Client glossary routing table
      | Pri | File | Keywords |
      |---|---|---|
      | 1 | [client.md](client.md) | client |
      ## Ownership
    MARKDOWN
  end

  def client_catalog
    <<~MARKDOWN
      # Client vocabulary catalog
      [Methodology catalog](../methodology/vocab/domain-references.md)
      ## Client canonical glossaries
      | Priority | Document | Scope |
      |---|---|---|
      | 1 | [client.md](client.md) | client |
      ## Ownership
    MARKDOWN
  end
end
