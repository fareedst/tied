#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "fileutils"
require "open3"
require "tmpdir"

# [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
# How: Verify report-first legacy migration preserves mixed and client-owned vocabulary while moving only exact methodology files.
class MigrateVocabOwnershipTest < Minitest::Test
  REPO_ROOT = File.expand_path("..", __dir__)
  SCRIPT = File.join(REPO_ROOT, "scripts", "migrate_vocab_ownership.rb")

  def test_report_only_detects_mixed_files_without_mutating_client
    Dir.mktmpdir do |root|
      vocab = File.join(root, "tied", "vocab")
      FileUtils.mkdir_p(vocab)
      canonical = File.join(REPO_ROOT, "tied", "vocab", "tied-methodology.md")
      FileUtils.cp(canonical, File.join(vocab, "tied-methodology.md"))
      File.write(File.join(vocab, "quality-assurance.md"), "client customization\n")
      File.write(File.join(vocab, "routing.md"), "# mixed routing\n")

      stdout, stderr, status = Open3.capture3("ruby", SCRIPT, "--fail-on-review", root)

      assert_equal 2, status.exitstatus, stderr
      assert_includes stdout, "CANDIDATE: tied-methodology.md"
      assert_includes stdout, "REVIEW: quality-assurance.md"
      assert_includes stdout, "REVIEW: routing.md"
      assert File.file?(File.join(vocab, "tied-methodology.md"))
      refute File.exist?(File.join(root, "tied", "methodology", "vocab", "tied-methodology.md"))
    end
  end

  def test_apply_moves_exact_methodology_files_and_preserves_client_files
    Dir.mktmpdir do |root|
      vocab = File.join(root, "tied", "vocab")
      FileUtils.mkdir_p(vocab)
      canonical = File.join(REPO_ROOT, "tied", "vocab", "tied-methodology.md")
      FileUtils.cp(canonical, File.join(vocab, "tied-methodology.md"))
      File.write(File.join(vocab, "client-only.md"), "# Client glossary\n")

      stdout, stderr, status = Open3.capture3("ruby", SCRIPT, "--apply", root)

      assert status.success?, stderr
      assert_includes stdout, "MOVE: tied-methodology.md"
      assert File.file?(File.join(root, "tied", "methodology", "vocab", "tied-methodology.md"))
      refute File.exist?(File.join(vocab, "tied-methodology.md"))
      assert File.file?(File.join(vocab, "client-only.md"))
    end
  end
end
