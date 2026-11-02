#!/usr/bin/env bash
set -euo pipefail
EVID="$(cd "$(dirname "$0")/../evidence" && pwd)"
TSV="$EVID/matrix-results.tsv"
ROOT=/Users/fareed/Documents/dev/test
ORDER_A=$'a\nb\na\nc\nb\n'
ORDER_B=$'b\na\nc\na\nb\n'
EMPTY=''
NO_NL=$'a\nb\na'
CRLF=$'a\r\na\n'

run_one() {
  local code="$1" flags="$2" row="$3" stdin_desc="$4" stdin="$5"
  shift 5
  local out exit_code
  set +e
  out=$(printf '%s' "$stdin" | "$@" 2>/dev/null)
  exit_code=$?
  set -e
  local esc_out
  esc_out=$(printf '%s' "$out" | tr '\n' '|' | sed 's/|$//')
  printf '%s\t%s\t%s\t%s\t%s\t%d\n' "$row" "$code" "$flags" "$stdin_desc" "$esc_out" "$exit_code"
}

: > "$TSV"
echo -e "row_id\tclient_code\tflags\tstdin_desc\tstdout_pipe_separated\texit_code" >> "$TSV"

cd "$ROOT/1793562432-wf-02-composer25" && npm run build -s
run_one Co default 1 ordering_A "$ORDER_A" node "$ROOT/1793562432-wf-02-composer25/dist/cli.js" >> "$TSV"
run_one Co default 2 ordering_B "$ORDER_B" node "$ROOT/1793562432-wf-02-composer25/dist/cli.js" >> "$TSV"
run_one Co default 3 empty "$EMPTY" node "$ROOT/1793562432-wf-02-composer25/dist/cli.js" >> "$TSV"
run_one Co default 4 no_final_nl "$NO_NL" node "$ROOT/1793562432-wf-02-composer25/dist/cli.js" >> "$TSV"
run_one Co default 5 crlf_vs_lf "$CRLF" node "$ROOT/1793562432-wf-02-composer25/dist/cli.js" >> "$TSV"

(cd "$ROOT/1793563063-wf-02-gemini4-argon-med" && npm run build -s) || true
GE_MAIN="$ROOT/1793563063-wf-02-gemini4-argon-med/dist/src/main.js"
for row in 1 2 3 4 5; do
  case "$row" in
    1) run_one Ge default "$row" ordering_A "$ORDER_A" node "$GE_MAIN" >> "$TSV" ;;
    2) run_one Ge default "$row" ordering_B "$ORDER_B" node "$GE_MAIN" >> "$TSV" ;;
    3) run_one Ge default "$row" empty "$EMPTY" node "$GE_MAIN" >> "$TSV" ;;
    4) run_one Ge default "$row" no_final_nl "$NO_NL" node "$GE_MAIN" >> "$TSV" ;;
    5) run_one Ge default "$row" crlf_vs_lf "$CRLF" node "$GE_MAIN" >> "$TSV" ;;
  esac
done
run_one Ge keep_last 6 ordering_A "$ORDER_A" node "$GE_MAIN" --keep last >> "$TSV"
run_one Ge keep_last 7 ordering_B "$ORDER_B" node "$GE_MAIN" --keep last >> "$TSV"

GR_CLI=(node --experimental-strip-types "$ROOT/1793574114-wf-02-grok47-med/src/cli.ts")
for row in 1 2 3 4 5; do
  case "$row" in
    1) run_one Gr default "$row" ordering_A "$ORDER_A" "${GR_CLI[@]}" >> "$TSV" ;;
    2) run_one Gr default "$row" ordering_B "$ORDER_B" "${GR_CLI[@]}" >> "$TSV" ;;
    3) run_one Gr default "$row" empty "$EMPTY" "${GR_CLI[@]}" >> "$TSV" ;;
    4) run_one Gr default "$row" no_final_nl "$NO_NL" "${GR_CLI[@]}" >> "$TSV" ;;
    5) run_one Gr default "$row" crlf_vs_lf "$CRLF" "${GR_CLI[@]}" >> "$TSV" ;;
  esac
done
run_one Gr keep_last 6 ordering_A "$ORDER_A" "${GR_CLI[@]}" --keep last >> "$TSV"
run_one Gr keep_last 7 ordering_B "$ORDER_B" "${GR_CLI[@]}" --keep last >> "$TSV"

LU="$ROOT/1793580151-wf-02-gpt56-luna-med/dedup_stream.py"
run_one Lu default 1 ordering_A "$ORDER_A" python3 "$LU" >> "$TSV"
run_one Lu default 2 ordering_B "$ORDER_B" python3 "$LU" >> "$TSV"
run_one Lu default 3 empty "$EMPTY" python3 "$LU" >> "$TSV"
run_one Lu default 4 no_final_nl "$NO_NL" python3 "$LU" >> "$TSV"
run_one Lu default 5 crlf_vs_lf "$CRLF" python3 "$LU" >> "$TSV"

SP="$ROOT/1793584262-wf-02-muse-spark13-med/src/dedup.py"
run_one Sp default 1 ordering_A "$ORDER_A" python3 "$SP" >> "$TSV"
run_one Sp default 2 ordering_B "$ORDER_B" python3 "$SP" >> "$TSV"
run_one Sp default 3 empty "$EMPTY" python3 "$SP" >> "$TSV"
run_one Sp default 4 no_final_nl "$NO_NL" python3 "$SP" >> "$TSV"
run_one Sp default 5 crlf_vs_lf "$CRLF" python3 "$SP" >> "$TSV"

WN="$ROOT/1793585717-wf-02-muse-wonder-med/src/dedup.py"
run_one Wn default 1 ordering_A "$ORDER_A" python3 "$WN" >> "$TSV"
run_one Wn default 2 ordering_B "$ORDER_B" python3 "$WN" >> "$TSV"
run_one Wn default 3 empty "$EMPTY" python3 "$WN" >> "$TSV"
run_one Wn default 4 no_final_nl "$NO_NL" python3 "$WN" >> "$TSV"
run_one Wn default 5 crlf_vs_lf "$CRLF" python3 "$WN" >> "$TSV"
run_one Wn keep_last 6 ordering_A "$ORDER_A" python3 "$WN" --keep last >> "$TSV"
run_one Wn keep_last 7 ordering_B "$ORDER_B" python3 "$WN" --keep last >> "$TSV"

SO="$ROOT/1793587208-wf-02-gpt56-sol-med/dedup.py"
run_one So default 1 ordering_A "$ORDER_A" python3 "$SO" >> "$TSV"
run_one So default 2 ordering_B "$ORDER_B" python3 "$SO" >> "$TSV"
run_one So default 3 empty "$EMPTY" python3 "$SO" >> "$TSV"
run_one So default 4 no_final_nl "$NO_NL" python3 "$SO" >> "$TSV"
run_one So default 5 crlf_vs_lf "$CRLF" python3 "$SO" >> "$TSV"

FA="$ROOT/1793589777-wf-02-claude-fable5-med/bin/dedup.js"
run_one Fa default 1 ordering_A "$ORDER_A" node "$FA" >> "$TSV"
run_one Fa default 2 ordering_B "$ORDER_B" node "$FA" >> "$TSV"
run_one Fa default 3 empty "$EMPTY" node "$FA" >> "$TSV"
run_one Fa default 4 no_final_nl "$NO_NL" node "$FA" >> "$TSV"
run_one Fa default 5 crlf_vs_lf "$CRLF" node "$FA" >> "$TSV"

OP="$ROOT/1793592181-wf-02-claude-opus55-med/bin/linededup"
run_one Op default 1 ordering_A "$ORDER_A" "$OP" >> "$TSV"
run_one Op default 2 ordering_B "$ORDER_B" "$OP" >> "$TSV"
run_one Op default 3 empty "$EMPTY" "$OP" >> "$TSV"
run_one Op default 4 no_final_nl "$NO_NL" "$OP" >> "$TSV"
run_one Op default 5 crlf_vs_lf "$CRLF" "$OP" >> "$TSV"
run_one Op keep_last 6 ordering_A "$ORDER_A" "$OP" --keep last >> "$TSV"
run_one Op keep_last 7 ordering_B "$ORDER_B" "$OP" --keep last >> "$TSV"

echo "Wrote $TSV"
