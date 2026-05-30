#!/usr/bin/env ruby
# frozen_string_literal: true

# [PROC-YAML_EDIT_LOOP] [REQ-TIED_SETUP]
# How: Unit and shell integration tests for yaml_list_sorter.rb and yaml_tool.sh.
#
# Run:
#   ruby scripts/yaml_list_sorter_test.rb

require 'open3'
require 'tempfile'
require 'fileutils'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

SCRIPT_DIR = File.expand_path(__dir__)
SORTER = File.join(SCRIPT_DIR, 'yaml_list_sorter.rb')
YAML_TOOL = File.join(SCRIPT_DIR, 'yaml_tool.sh')

def run_sorter(args)
  cmd = ['ruby', SORTER, *args]
  out, err, status = Open3.capture3(*cmd)
  [out, err, status]
end

def run_yaml_tool(args)
  cmd = [YAML_TOOL, *args]
  out, err, status = Open3.capture3(*cmd)
  [out, err, status]
end

def write_temp_yaml!(content)
  f = Tempfile.new(%w[yaml_sort_test_ .yaml])
  f.write(content)
  f.flush
  f
end

# --- YamlListSorter: group of 2 unchanged ---
f2 = write_temp_yaml!(<<~YAML)
  items:
    - zebra
    - alpha
YAML
orig2 = File.read(f2.path)
_out, _err, st = run_sorter([f2.path])
assert st.success?, "sorter exit 2-item group: #{_err}"
assert File.read(f2.path) == orig2, 'group of 2 should not be sorted'
f2.close!

# --- group of 3+ sorted ---
f3 = write_temp_yaml!(<<~YAML)
  cross_references:
    - REQ-Z
    - REQ-A
    - REQ-M
YAML
_out, _err, st = run_sorter([f3.path])
assert st.success?, "sorter exit 3-item group: #{_err}"
sorted = File.read(f3.path)
assert sorted.include?("- REQ-A\n"), "expected REQ-A first in group:\n#{sorted}"
assert sorted.index('- REQ-A') < sorted.index('- REQ-M'), 'REQ-A before REQ-M'
assert sorted.index('- REQ-M') < sorted.index('- REQ-Z'), 'REQ-M before REQ-Z'
f3.close!

# --- mixed indent: separate groups ---
fm = write_temp_yaml!(<<~YAML)
  top:
    - c
    - a
    - b
  nested:
    - z
    - y
    - x
YAML
_out, _err, st = run_sorter([fm.path])
assert st.success?, "mixed indent: #{_err}"
mixed = File.read(fm.path)
top_block = mixed[/top:\n(.*?)\nnested:/m, 1]
assert top_block.include?("- a\n"), "top group sorted: #{top_block}"
nested_block = mixed[/nested:\n(.*)\z/m, 1]
assert nested_block.include?("- x\n"), "nested group sorted: #{nested_block}"
fm.close!

# --- already sorted: groups_modified=0 ---
fa = write_temp_yaml!(<<~YAML)
  refs:
    - alpha
    - beta
    - gamma
YAML
before_mtime = File.mtime(fa.path)
sleep 0.05
out, _err, st = run_sorter([fa.path])
assert st.success?, "already sorted: #{_err}"
assert out.include?('groups modified=0'), "expected no modifications: #{out}"
assert File.mtime(fa.path) == before_mtime, 'file should not be rewritten when unchanged'
fa.close!

# --- invalid path ---
_out, _err, st = run_sorter(['/no/such/yaml_list_sorter_test_file.yaml'])
assert !st.success?, 'missing file should fail'

# --- yaml_tool default lint (requires yq) ---
if system('command -v yq >/dev/null 2>&1')
  fl = write_temp_yaml!("key: value\n")
  _out, _err, st = run_yaml_tool([fl.path])
  assert st.success?, "yaml_tool lint failed: #{_err}"
  fl.close!

  fs = write_temp_yaml!(<<~YAML)
    tags:
      - zed
      - ant
      - mid
  YAML
  _out, _err, st = run_yaml_tool(['--sort-lists', fs.path])
  assert st.success?, "yaml_tool --sort-lists failed: #{_err}"
  body = File.read(fs.path)
  assert body.index('- ant') < body.index('- mid'), "yaml_tool sort: #{body}"
  fs.close!
else
  warn 'SKIP: yq not on PATH; yaml_tool lint integration tests skipped'
end

puts 'yaml_list_sorter_test.rb: all assertions passed'
