#!/usr/bin/env bash
#
# yaml_minimize:
#   Stream-edit a large YAML file and remove lines whose values are empty-ish:
#   null, undefined, ~, "", '', empty flow mapping {}, or nothing after the
#   colon (bare colon), unless
#   the next line looks like block content under that key (deeper indent or a
#   block sequence entry line starting with "-").
#   Three modes:
#
#     1) exec     : execute immediately
#     2) preview  : show proposed changes only
#     3) approve  : preview, ask for approval, then execute
#
# Notes:
#   - Single-pass read, O(1) memory: one line of look-ahead only (safe for
#     multi-GB files). Output streams to a temp file then mv for in-place exec.
#   - Line-oriented only; not a full YAML parser (flow collections, anchors,
#     quoted keys with spaces, etc.).
#   - Only keys that are one space-free token after indent (e.g. details:) are
#     considered; keys containing spaces are never matched.
#   - If a blank line sits between a key line and a following "- " list line,
#     the structural guard may not apply; verify critical files after run.
#   - In-place replacement is done safely via temp file + mv.
#   - Preview reads the same stream but stops after PREVIEW_LINES hunks.
#
yaml_minimize () {
  local mode="${1:-}"
  local src="${2:-}"
  local dst="${3:-}"
  local preview_lines="${4:-20}"

  if [[ -z "$mode" || -z "$src" ]]; then
    printf 'usage: yaml_minimize {exec|preview|approve} SOURCE [DEST] [PREVIEW_LINES]\n' >&2
    return 2
  fi

  if [[ ! -f "$src" ]]; then
    printf 'source file not found: %s\n' "$src" >&2
    return 2
  fi

  local awk_prog='
function simple_key(s) {
  return s ~ /^[[:space:]]*[^[:space:]]+:/
}
function changed_line(s) {
  if (!simple_key(s)) return 0
  return s ~ /:[[:space:]]*null[[:space:]]*$/ ||
    s ~ /:[[:space:]]*undefined[[:space:]]*$/ ||
    s ~ /:[[:space:]]*~[[:space:]]*$/ ||
    s ~ /:[[:space:]]*""[[:space:]]*$/ ||
    s ~ /:[[:space:]]*\047\047[[:space:]]*$/ ||
    s ~ /:[[:space:]]*\{[[:space:]]*\}[[:space:]]*$/ ||
    s ~ /:[[:space:]]*$/
}
function lead(s) {
  if (match(s, /^[[:space:]]*/))
    return RLENGTH
  return 0
}
function structural_child(cur, nxt) {
  if (nxt == "") return 0
  if (lead(nxt) > lead(cur)) return 1
  if (nxt ~ /^[[:space:]]*-/) {
    if (lead(nxt) >= lead(cur)) return 1
  }
  return 0
}
function deletable(cur, nxt) {
  return changed_line(cur) && !structural_child(cur, nxt)
}
'

  case "$mode" in
    p*)
      LC_ALL=C gawk -v limit="$preview_lines" "$awk_prog"'
      BEGIN { shown = 0 }
      NR == 1 {
        cur = $0
        cur_nr = 1
        next
      }
      {
        if (deletable(cur, $0)) {
          printf "%d | - %s\n", cur_nr, cur
          printf "%d | + (line removed)\n\n", cur_nr
          shown++
          if (shown >= limit) exit
        }
        cur = $0
        cur_nr = NR
      }
      END {
        if (shown < limit && NR >= 1) {
          if (deletable(cur, "")) {
            printf "%d | - %s\n", cur_nr, cur
            printf "%d | + (line removed)\n\n", cur_nr
            shown++
          }
        }
        if (shown == 0) {
          print "no matching lines found"
        }
      }' "$src"
      ;;

    e*)
      local out tmp dir
      if [[ -n "$dst" ]]; then
        out="$dst"
      else
        dir="$(dirname -- "$src")"
        tmp="$(mktemp "$dir/.yaml_minimize.XXXXXX")" || return 1
        out="$tmp"
      fi

      if ! LC_ALL=C awk "$awk_prog"'
      NR == 1 {
        cur = $0
        next
      }
      {
        if (!deletable(cur, $0))
          print cur
        cur = $0
      }
      END {
        if (NR >= 1 && !deletable(cur, ""))
          print cur
      }' "$src" > "$out"
      then
        [[ -n "$tmp" && -e "$tmp" ]] && rm -f -- "$tmp"
        return 1
      fi

      if [[ -n "$tmp" ]]; then
        mv -- "$tmp" "$src"
      fi
      ;;

    a*)
      yaml_minimize preview "$src" "$dst" "$preview_lines" || return $?
      printf 'apply these changes? [y/N] '
      local reply
      IFS= read -r reply
      case "$reply" in
        y|Y|yes|YES)
          yaml_minimize exec "$src" "$dst" "$preview_lines"
          ;;
        *)
          printf 'aborted\n' >&2
          return 1
          ;;
      esac
      ;;

    *)
      printf 'invalid mode: %s\n' "$mode" >&2
      printf 'usage: yaml_minimize {exec|preview|approve} SOURCE [DEST] [PREVIEW_LINES]\n' >&2
      return 2
      ;;
  esac
}


# Only execute if script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  set -euo pipefail
  yaml_minimize "$@"
fi
