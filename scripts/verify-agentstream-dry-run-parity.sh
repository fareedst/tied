#!/usr/bin/env bash
# Compare dry-run turn count and per-turn prompt bodies between Ruby run_agent_stream.rb and Go agentstream.
# REQ: REQ-GOAGENT-CLI-CONFIG, REQ-GOAGENT-PIPELINE-CHAIN
# Fixtures: scripts/testdata-dry-run-parity/
#
# Note: Ruby prints a single "command:" line via Shellwords.join; multi-line prompts can make that
# line span stdout in a way that looks like extra lines (shell-escaped fragments). We compare only
# prompt text between "--- argv part" headers and the first "command:" line per turn.
set -o errexit
set -o nounset
set -o pipefail

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_repo_root="$(cd "${_script_dir}/.." && pwd)"
_data="${_script_dir}/testdata-dry-run-parity"
_module_root="${_repo_root}/tools/agentstream"

fail() {
  printf 'verify-agentstream-dry-run-parity: %s\n' "$1" >&2
  exit 1
}

[[ -d "${_data}" ]] || fail "missing ${_data}"
[[ -d "${_module_root}" ]] || fail "missing Go module ${_module_root}"

_tmp="$(mktemp -d)"
_cleanup() { rm -rf "${_tmp}"; }
trap _cleanup EXIT

_ruby_runner="${_repo_root}/tools/agent-stream/run_agent_stream.rb"
[[ -f "${_ruby_runner}" ]] || fail "missing ${_ruby_runner}"

ruby "${_ruby_runner}" --dry-run \
  --workspace "${_data}" \
  --lead-checklist-yaml "${_data}/lead-checklist-min.yaml" \
  --feature-spec-batch-order 1 \
  --prompt-file "${_data}/prompt.txt" \
  --feature-spec-batch-yaml "${_data}/batch.yaml" \
  >"${_tmp}/ruby.out" 2>&1 || fail "ruby run_agent_stream.rb --dry-run failed"

go run -C "${_module_root}" ./cmd/agentstream -d \
  -w "${_data}" \
  -c "${_data}/lead-checklist-min.yaml" \
  -p "${_data}/prompt.txt" \
  -b "${_data}/batch.yaml" \
  -o 1 >"${_tmp}/go.out" 2>&1 || fail "agentstream -d failed"

ruby_turns="$(grep -c -E '^--- turn [0-9]+/[0-9]+' "${_tmp}/ruby.out" || true)"
go_turns="$(grep -c -E '^--- turn [0-9]+/[0-9]+' "${_tmp}/go.out" || true)"

if [[ "${ruby_turns}" != "${go_turns}" ]]; then
  printf 'Turn count mismatch: ruby=%s go=%s\n' "${ruby_turns}" "${go_turns}" >&2
  fail "dry-run turn counts differ"
fi

# Extract prompts: for each "--- argv part i/n ---", collect lines until "command:".
extract_prompts_awk=$(
  cat <<'AWK'
BEGIN { inpart=0; empty=1 }
/^--- argv part / { inpart=1; empty=1; next }
inpart && /^command:/ { inpart=0; print ""; next }
inpart {
  if (empty) { printf "%s", $0; empty=0 }
  else { printf "\n%s", $0 }
}
AWK
)

ruby_prompts="${_tmp}/ruby-prompts.txt"
go_prompts="${_tmp}/go-prompts.txt"
awk "${extract_prompts_awk}" "${_tmp}/ruby.out" | sed "s|${_data}|<DATA>|g" >"${ruby_prompts}"
awk "${extract_prompts_awk}" "${_tmp}/go.out" | sed "s|${_data}|<DATA>|g" >"${go_prompts}"

if ! diff -u "${ruby_prompts}" "${go_prompts}" >"${_tmp}/diff.txt"; then
  cat "${_tmp}/diff.txt" >&2
  fail "prompt bodies differ between Ruby and Go dry-run"
fi

# Session labels: turn 1 starts a new session (preload + feature batch); turns 2–3 resume after checklist chaining.
# Ruby dry-run uses a literal resume placeholder in stderr; Go uses <session_id_from_previous_turn>.
if [[ "${go_turns}" != 3 ]]; then
  fail "expected 3 turns with prompt-file preload merged (got ${go_turns})"
fi
if ! grep -qE '^--- turn 1/3 \(new session\) ---' "${_tmp}/ruby.out" || ! grep -qE '^--- turn 1/3 \(new session\) ---' "${_tmp}/go.out"; then
  fail "expected turn 1/3 (new session) in both ruby and go dry-run stderr"
fi
if ! grep -qE '^--- turn 2/3 \(resume .*\) ---' "${_tmp}/ruby.out" || ! grep -qE '^--- turn 2/3 \(resume .*\)' "${_tmp}/go.out"; then
  fail "expected turn 2/3 resume in both ruby and go dry-run stderr"
fi

printf 'verify-agentstream-dry-run-parity: OK (%s turns; prompt bodies match; session labels consistent).\n' "${go_turns}"
