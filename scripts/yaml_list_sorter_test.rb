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

require_relative 'yaml_semantic_compare'
require_relative 'yaml_list_sorter'

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

# --- YamlListSorter: group of 2 sorted ---
f2 = write_temp_yaml!(<<~YAML)
  items:
    - zebra
    - alpha
YAML
_out, _err, st = run_sorter([f2.path])
assert st.success?, "sorter exit 2-item group: #{_err}"
sorted2 = File.read(f2.path)
assert sorted2.index('- alpha') < sorted2.index('- zebra'), "group of 2 should be sorted:\n#{sorted2}"
f2.close!

# --- single-item list unchanged ---
f1 = write_temp_yaml!(<<~YAML)
  items:
    - only
YAML
orig1 = File.read(f1.path)
_out, _err, st = run_sorter([f1.path])
assert st.success?, "sorter exit 1-item group: #{_err}"
assert File.read(f1.path) == orig1, 'single-item list should not be sorted'
f1.close!

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

# --- last line without trailing newline (EOF): must not merge with prior line after sort ---
feof = write_temp_yaml!(<<~YAML)
  key:
  - zebra
  - alpha
YAML
# Heredoc ends with newline on "- alpha"; strip only the final newline on the file.
eof_path = feof.path
File.write(eof_path, File.read(eof_path).chomp, encoding: 'UTF-8')
_out, _err, st = run_sorter([eof_path])
assert st.success?, "EOF list newline: #{_err}"
eof_body = File.read(eof_path)
assert eof_body.include?("- alpha\n"), "alpha on its own line:\n#{eof_body.inspect}"
assert eof_body.include?("- zebra\n"), "zebra on its own line:\n#{eof_body.inspect}"
assert !eof_body.include?("alpha- zebra"), "lines must not merge:\n#{eof_body.inspect}"
feof.close!

# --- multiline single-quoted scalar (code_markers style): colon lines must not reorder ---
fcm = write_temp_yaml!(<<~YAML)
  code_markers: '`archive.go` line ~695: first paragraph

    Line ~697: second paragraph

    Line ~704: third paragraph

    `tail.go`: final marker'
YAML
cm_before = File.read(fcm.path)
_out, _err, st = run_sorter(['--sort-keys', fcm.path])
assert st.success?, "single-quoted scalar sort-keys: #{_err}"
cm_after = File.read(fcm.path)
assert cm_after.index('Line ~697:') < cm_after.index('Line ~704:'),
       "Line paragraphs must stay in order:\n#{cm_after}"
assert cm_after.index('first paragraph') < cm_after.index('Line ~697:'),
       "opening paragraph before Line ~697:\n#{cm_after}"
assert cm_after.include?('final marker'), "single-quoted tail preserved:\n#{cm_after}"
fcm.close!

# --- multiline double-quoted scalar: sort-keys must not reorder colon lines inside ---
fqs = write_temp_yaml!(<<~YAML)
  essence_pseudocode: "# start\n\
    \ zebra: 1\n\
    \ alpha: 2\n\
    \ PRESERVE_ORDER_MARKER"
YAML
qs_before = File.read(fqs.path)
_out, _err, st = run_sorter(['--sort-keys', fqs.path])
assert st.success?, "quoted scalar sort-keys: #{_err}"
qs_after = File.read(fqs.path)
assert qs_after.index('zebra: 1') < qs_after.index('alpha: 2'),
       "colon lines inside quoted scalar must not be reordered:\n#{qs_after}"
assert qs_after.include?('PRESERVE_ORDER_MARKER'), "quoted scalar tail preserved:\n#{qs_after}"
fqs.close!

# --- multiline quoted scalar without EOF newline: last line preserved ---
fq_eof = write_temp_yaml!(<<~YAML)
  essence_pseudocode: "# start\n\
    \ middle\n\
    \ EOF_TAIL_MARKER"
YAML
eof_path = fq_eof.path
File.write(eof_path, File.read(eof_path).chomp, encoding: 'UTF-8')
_out, _err, st = run_sorter([eof_path])
assert st.success?, "quoted scalar EOF: #{_err}"
assert File.read(eof_path).include?('EOF_TAIL_MARKER'), "EOF tail marker missing"
fq_eof.close!

# --- same-indent block sequence under key (no extra indent on "- " lines) ---
fsi = write_temp_yaml!(<<~YAML)
  key:
  - zebra
  - alpha
YAML
_out, _err, st = run_sorter([fsi.path])
assert st.success?, "same-indent list sort: #{_err}"
si_body = File.read(fsi.path)
assert si_body =~ /key:\n- alpha\n- zebra/m, "same-indent list sorted under key:\n#{si_body}"
fsi.close!

# --- same-indent lists stay with keys when --sort-keys ---
fsk = write_temp_yaml!(<<~YAML)
  z:
  - zebra
  a:
  - alpha
YAML
_out, _err, st = run_sorter(['--sort-keys', fsk.path])
assert st.success?, "same-indent sort-keys: #{_err}"
sk_body = File.read(fsk.path)
assert sk_body.index('a:') < sk_body.index('z:'), "keys sorted:\n#{sk_body}"
a_block = sk_body[/a:\n(.*?)\nz:/m, 1]
z_block = sk_body[/z:\n(.*)\z/m, 1]
assert a_block.include?('- alpha'), "alpha list under a:\n#{sk_body}"
assert z_block.include?('- zebra'), "zebra list under z:\n#{sk_body}"
fsk.close!

# --- nested key with same-indent block sequence ---
fsn = write_temp_yaml!(<<~YAML)
  parent:
    child:
    - b
    - a
YAML
_out, _err, st = run_sorter([fsn.path])
assert st.success?, "nested same-indent list: #{_err}"
sn_body = File.read(fsn.path)
child_block = sn_body[/child:\n(.*?)\z/m, 1]
assert child_block.index('- a') < child_block.index('- b'), "child list sorted:\n#{sn_body}"
fsn.close!

# --- inline key value: same-indent list is sibling, not key block value ---
fiv = write_temp_yaml!(<<~YAML)
  key: value
  - zebra
  - alpha
YAML
iv_body = File.read(fiv.path)
sorter_iv = YamlListSorter.new(fiv.path)
opaque_iv = sorter_iv.send(:block_scalar_regions, sorter_iv.send(:normalize_line_endings, File.readlines(fiv.path, chomp: false)))
sorted_iv_lines, = sorter_iv.sort_list_groups(sorter_iv.send(:normalize_line_endings, File.readlines(fiv.path, chomp: false)), opaque_iv)
sorted_iv = sorted_iv_lines.join
assert sorted_iv.include?("key: value\n"), "inline key line preserved:\n#{sorted_iv}"
assert sorted_iv.index('key: value') < sorted_iv.index('- alpha'), "list follows inline key:\n#{sorted_iv}"
assert sorted_iv.index('- alpha') < sorted_iv.index('- zebra'), "sibling list sorted:\n#{sorted_iv}"
_out, err, st = run_sorter([fiv.path])
assert !st.success?, 'invalid YAML sibling list must fail semantic validation on run'
assert err.include?('failed to parse'), "expected parse validation error: #{err}"
assert File.read(fiv.path) == iv_body, 'invalid YAML must not be written on validation failure'
fiv.close!

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

# --- top-level map keys sorted with --sort-keys ---
fk = write_temp_yaml!(<<~YAML)
  b: two
  a: one
YAML
_out, _err, st = run_sorter(['--sort-keys', fk.path])
assert st.success?, "sort-keys top level: #{_err}"
keys_body = File.read(fk.path)
assert keys_body.index('a:') < keys_body.index('b:'), "top-level keys sorted:\n#{keys_body}"
assert _out.include?('maps found=1'), "expected maps found=1: #{_out}"
fk.close!

# --- nested map keys sorted with --sort-keys ---
fn = write_temp_yaml!(<<~YAML)
  parent:
    z: last
    a: first
YAML
_out, _err, st = run_sorter(['--sort-keys', fn.path])
assert st.success?, "sort-keys nested: #{_err}"
nested_body = File.read(fn.path)
parent_block = nested_body[/parent:\n(.*)\z/m, 1]
assert parent_block.index('a:') < parent_block.index('z:'), "nested keys sorted:\n#{nested_body}"
fn.close!

# --- already sorted keys: maps modified=0 ---
fks = write_temp_yaml!(<<~YAML)
  alpha: 1
  beta: 2
YAML
before_keys_mtime = File.mtime(fks.path)
sleep 0.05
out, _err, st = run_sorter(['--sort-keys', fks.path])
assert st.success?, "already sorted keys: #{_err}"
assert out.include?('maps modified=0'), "expected no key modifications: #{out}"
assert File.mtime(fks.path) == before_keys_mtime, 'file should not be rewritten when keys unchanged'
fks.close!

# --- combined --sort-keys and 2-item list sort ---
fc = write_temp_yaml!(<<~YAML)
  z_section:
    - zebra
    - alpha
  b_key: two
  a_key: one
YAML
_out, _err, st = run_sorter(['--sort-keys', fc.path])
assert st.success?, "combined sort: #{_err}"
combo = File.read(fc.path)
assert combo.index('a_key:') < combo.index('b_key:'), "keys sorted in combo:\n#{combo}"
assert combo.index('- alpha') < combo.index('- zebra'), "lists sorted in combo:\n#{combo}"
fc.close!

# --- block scalar body: fake keys not sorted with --sort-keys ---
fbs = write_temp_yaml!(<<~YAML)
  z_meta: last
  note: |
    z_key: inside
    a_key: inside
  a_meta: first
YAML
note_block_orig = <<~YAML
  note: |
    z_key: inside
    a_key: inside
YAML
_out, _err, st = run_sorter(['--sort-keys', fbs.path])
assert st.success?, "block scalar keys guard: #{_err}"
bs_body = File.read(fbs.path)
assert bs_body.include?(note_block_orig), "block scalar body must stay unchanged:\n#{bs_body}"
assert bs_body.index('a_meta:') < bs_body.index('z_meta:'), "sibling keys outside scalar sorted:\n#{bs_body}"
fbs.close!

# --- block scalar body: list-like lines not sorted ---
fbl = write_temp_yaml!(<<~YAML)
  tags:
    - zebra
    - alpha
  note: |
    - zebra item
    - alpha item
YAML
_out, _err, st = run_sorter([fbl.path])
assert st.success?, "block scalar list guard: #{_err}"
bl_body = File.read(fbl.path)
note_list_section = bl_body[/note: \|\n(.*)\z/m, 1]
assert note_list_section.index('- zebra item') < note_list_section.index('- alpha item'),
       "block scalar list lines unchanged:\n#{bl_body}"
assert bl_body.index('- alpha') < bl_body.index('- zebra'), "real list sorted:\n#{bl_body}"
fbl.close!

# --- block scalar variants: |- and > ---
fbv = write_temp_yaml!(<<~YAML)
  z_key: last
  note: |-
    z_inner: one
    a_inner: two
  folded: >
    z_fold: one
    a_fold: two
  a_key: first
YAML
_out, _err, st = run_sorter(['--sort-keys', fbv.path])
assert st.success?, "block scalar variants: #{_err}"
bv_body = File.read(fbv.path)
assert bv_body.index('z_inner: one') < bv_body.index('a_inner: two'),
       "literal chomping body unchanged:\n#{bv_body}"
assert bv_body.index('z_fold: one') < bv_body.index('a_fold: two'),
       "folded scalar body unchanged:\n#{bv_body}"
assert bv_body.index('a_key:') < bv_body.index('z_key:'), "keys outside scalars sorted:\n#{bv_body}"
fbv.close!

# --- combined: scalar + real keys and lists ---
fcombo = write_temp_yaml!(<<~YAML)
  z_meta: last
  note: |
    prose with key: value
    - looks like list
  a_meta: first
  tags:
    - zebra
    - alpha
YAML
note_combo_orig = <<~YAML
  note: |
    prose with key: value
    - looks like list
YAML
_out, _err, st = run_sorter(['--sort-keys', fcombo.path])
assert st.success?, "combined block scalar guard: #{_err}"
combo_bs = File.read(fcombo.path)
assert combo_bs.include?(note_combo_orig), "note block unchanged:\n#{combo_bs}"
assert combo_bs.index('a_meta:') < combo_bs.index('z_meta:'), "meta keys sorted:\n#{combo_bs}"
assert combo_bs.index('- alpha') < combo_bs.index('- zebra'), "tags sorted:\n#{combo_bs}"
fcombo.close!

# --- invalid path ---
_out, _err, st = run_sorter(['/no/such/yaml_list_sorter_test_file.yaml'])
assert !st.success?, 'missing file should fail'

# --- YamlSemanticCompare: unordered vs strict array order ---
left_array = { 'items' => %w[zebra alpha] }
right_array = { 'items' => %w[alpha zebra] }
unordered = YamlSemanticCompare.compare(left_array, right_array, unordered_arrays: true)
assert unordered.ok, "unordered compare should ignore list order: #{unordered.differences.inspect}"
strict = YamlSemanticCompare.compare(left_array, right_array, unordered_arrays: false)
assert !strict.ok, 'strict compare should fail when list order differs'
assert strict.differences.any? { |d| d.include?('items') }, "expected item path in diffs: #{strict.differences}"

# --- YamlSemanticCompare: key-only reorder passes strict ---
left_keys = { 'b' => 2, 'a' => 1 }
right_keys = { 'a' => 1, 'b' => 2 }
key_compare = YamlSemanticCompare.compare(left_keys, right_keys, unordered_arrays: false)
assert key_compare.ok, "hash key order should not affect semantic compare: #{key_compare.differences.inspect}"

# --- successful sort reports semantic validation ---
fval = write_temp_yaml!(<<~YAML)
  tags:
    - zebra
    - alpha
YAML
out, _err, st = run_sorter([fval.path])
assert st.success?, "validation pass sort: #{_err}"
assert out.include?('semantic validation passed'), "expected validation message: #{out}"
fval.close!

# --- validation failure leaves file unchanged ---
class RejectingYamlListSorter < YamlListSorter
  def validate_sorted_content!(*)
    raise SemanticSortValidationError.new(
      'injected validation failure',
      differences: ['$.items[0]: left="zebra", right="alpha"']
    )
  end
end

frej = write_temp_yaml!(<<~YAML)
  tags:
    - zebra
    - alpha
YAML
before_reject = File.read(frej.path)
before_mtime = File.mtime(frej.path)
sleep 0.05
rejected = false
begin
  RejectingYamlListSorter.new(frej.path).run
rescue SemanticSortValidationError => e
  rejected = true
  assert e.differences.any?, "expected diff lines: #{e.differences.inspect}"
end
assert rejected, 'validate_sorted_content! failure should propagate from run'
assert File.read(frej.path) == before_reject, 'file must remain unchanged on validation failure'
assert File.mtime(frej.path) == before_mtime, 'mtime must remain unchanged on validation failure'
frej.close!

# --- CLI reports semantic validation failures on stderr ---
fcli = write_temp_yaml!(<<~YAML)
  key: value
  - zebra
  - alpha
YAML
cli_before = File.read(fcli.path)
_out, err, st = run_sorter([fcli.path])
assert !st.success?, 'CLI should exit non-zero when semantic validation fails'
assert err.include?('semantic validation failed'), "stderr: #{err}"
assert err.include?('file not modified'), "stderr: #{err}"
assert err.include?('yaml_list_sorter:'), "expected summary footer: #{err}"
assert err.include?('failed (exit 1)'), "expected exit summary: #{err}"
assert err.include?('failed to parse'), "stderr parse detail: #{err}"
assert File.read(fcli.path) == cli_before, 'CLI path must not write on validation failure'
fcli.close!

# --- validate_sorted_content! rejects semantic drift ---
fdrift = write_temp_yaml!("items:\n  - alpha\n")
sorter = YamlListSorter.new(fdrift.path)
failed = false
begin
  sorter.validate_sorted_content!("items:\n  - alpha\n", "items:\n  - beta\n", groups_modified: 1)
rescue SemanticSortValidationError => e
  failed = true
  assert e.differences.any?, "expected diff lines: #{e.differences.inspect}"
end
assert failed, 'validate_sorted_content! should reject changed list values'
fdrift.close!

# --- validate_sorted_content! rejects unparseable sorted content ---
funparse = write_temp_yaml!("key: value\n")
sorter_unparse = YamlListSorter.new(funparse.path)
parse_failed = false
begin
  sorter_unparse.validate_sorted_content!("key: value\n", "key: [unclosed\n", groups_modified: 0)
rescue SemanticSortValidationError => e
  parse_failed = true
  assert e.message.include?('sorted content failed to parse'), "expected parse error message: #{e.message}"
  assert e.differences.empty?, 'parse errors should not include diff lines'
end
assert parse_failed, 'validate_sorted_content! should reject unparseable sorted YAML'
funparse.close!

# --- yaml_tool default lint (requires yq) ---
# [PROC-YAML_EDIT_LOOP] [IMPL-TIED_FILES] — default lint: sort_keys(.. style="double")
if system('command -v yq >/dev/null 2>&1')
  fl = write_temp_yaml!("key: value\n")
  _out, _err, st = run_yaml_tool([fl.path])
  assert st.success?, "yaml_tool lint failed: #{_err}"
  fl_body = File.read(fl.path)
  assert fl_body.include?('"value"') || fl_body.include?('key: "value"'),
         "yaml_tool lint double-quote: #{fl_body}"
  fl.close!

  # Default lint: recursive key sort + double-quoted scalars (bool → string)
  dq = write_temp_yaml!(<<~YAML)
    b: two
    flag: false
    a: one
    count: 0
  YAML
  _out, _err, st = run_yaml_tool([dq.path])
  assert st.success?, "yaml_tool double-quote lint failed: #{_err}"
  dq_body = File.read(dq.path)
  assert dq_body.index('a:') < dq_body.index('b:'), "yaml_tool lint key order: #{dq_body}"
  assert dq_body.match?(/flag:\s*"false"/), "yaml_tool lint bool stringify: #{dq_body}"
  assert dq_body.match?(/count:\s*"0"/), "yaml_tool lint int stringify: #{dq_body}"
  assert dq_body.match?(/a:\s*"one"/), "yaml_tool lint string quote: #{dq_body}"
  dq.close!

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

  fk_tool = write_temp_yaml!(<<~YAML)
    b: two
    a: one
  YAML
  _out, _err, st = run_yaml_tool(['--sort-lists', '--sort-keys', fk_tool.path])
  assert st.success?, "yaml_tool --sort-lists --sort-keys failed: #{_err}"
  tool_keys = File.read(fk_tool.path)
  assert tool_keys.index('a:') < tool_keys.index('b:'), "yaml_tool sort-keys: #{tool_keys}"
  fk_tool.close!
else
  warn 'SKIP: yq not on PATH; yaml_tool lint integration tests skipped'
end

puts 'yaml_list_sorter_test.rb: all assertions passed'
