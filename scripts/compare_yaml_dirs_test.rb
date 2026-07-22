#!/usr/bin/env ruby
# frozen_string_literal: true

# Smoke tests for compare_yaml_dirs.rb [IMPL-TIED_FILES] [REQ-TIED_SETUP] [PROC-YAML_EDIT_LOOP]
# How: Directory-level YAML semantic comparison; reports missing files and value diffs; exit 0 when equal.
# Run: ruby scripts/compare_yaml_dirs_test.rb

require 'fileutils'
require 'open3'
require 'tmpdir'

ROOT = File.expand_path('..', __dir__)
COMPARE = File.join(ROOT, 'scripts', 'compare_yaml_dirs.rb')

def run_compare(args)
  Open3.capture3('ruby', COMPARE, *args)
end

def assert(cond, msg)
  raise "ASSERT: #{msg}" unless cond
end

Dir.mktmpdir('compare-yaml-dirs-') do |tmp|
  left = File.join(tmp, 'left')
  right = File.join(tmp, 'right')
  FileUtils.mkdir_p([left, right])

  File.write(File.join(left, 'a.yaml'), "z: 1\nb: 2\n")
  File.write(File.join(right, 'a.yaml'), "b: 2\nz: 1\n")

  out, err, st = run_compare([left, right])
  assert st.success?, "equal maps (key order ignored) should exit 0: #{err}\n#{out}"
  assert out.include?('No differences found.'), "stdout: #{out}"

  File.write(File.join(right, 'a.yaml'), "b: 3\nz: 1\n")
  out, err, st = run_compare([left, right])
  assert !st.success?, 'value mismatch should exit non-zero'
  assert out.include?('Files with differences'), "stdout: #{out}"

  File.write(File.join(left, 'only_left.yaml'), "x: 1\n")
  File.write(File.join(right, 'a.yaml'), "b: 2\nz: 1\n")
  out, err, st = run_compare([left, right])
  assert !st.success?, 'missing file should exit non-zero'
  assert out.include?('Files only in left directory'), "stdout: #{out}"

  FileUtils.rm_f(File.join(left, 'only_left.yaml'))
  File.write(File.join(left, 'list.yaml'), "- b\n- a\n")
  File.write(File.join(right, 'list.yaml'), "- a\n- b\n")
  FileUtils.rm_f(File.join(left, 'a.yaml'))
  FileUtils.rm_f(File.join(right, 'a.yaml'))

  out, err, st = run_compare([left, right])
  assert !st.success?, 'ordered array mismatch should fail by default'

  out, err, st = run_compare(['--unordered-arrays', left, right])
  assert st.success?, "unordered arrays should match: #{err}\n#{out}"
end

puts 'compare_yaml_dirs_test.rb: OK'
