# operator-stderr-line.inc.sh — elapsed DEBUG/DIAGNOSTIC stderr for WF orchestrators and agentstream parity.
# [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [IMPL-AGENTSTREAM_OPERATOR_STDERR_ELAPSED]
# [ARCH-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]

operator_stderr_epoch_init() {
  if [[ -n "${TIED_OPERATOR_EPOCH_MS:-}" ]]; then
    export TIED_OPERATOR_EPOCH_MS
    return 0
  fi
  if ! command -v node >/dev/null 2>&1; then
  printf 'DIAGNOSTIC: operator_stderr_epoch_init requires node\n' >&2
    return 1
  fi
  TIED_OPERATOR_EPOCH_MS="$(node -p 'Date.now()')"
  export TIED_OPERATOR_EPOCH_MS
}

_operator_stderr_plain_mode() {
  if [[ "${AGENTSTREAM_OPERATOR_ELAPSED:-1}" == "0" ]]; then
    return 0
  fi
  if [[ -n "${NO_COLOR:-}" || "${TIED_CLI_PLAIN:-}" == "1" || "${_PLAIN_CLI:-0}" == "1" ]]; then
    return 0
  fi
  if [[ ! -t 2 ]]; then
    return 0
  fi
  return 1
}

_operator_stderr_offset() {
  local now ms sec
  if ! command -v node >/dev/null 2>&1; then
    printf '0000'
    return 0
  fi
  now="$(node -p 'Date.now()')"
  ms=$((now - TIED_OPERATOR_EPOCH_MS))
  if (( ms < 0 )); then
    ms=0
  fi
  sec=$((ms / 1000))
  if (( sec > 9999 )); then
    sec=9999
  fi
  printf '%04d' "$sec"
}

# Plain formatted line (no ANSI); for log file append.
operator_stderr_line_format() {
  local level="$1"
  shift
  local msg="$*"
  local off

  if [[ "${AGENTSTREAM_OPERATOR_ELAPSED:-1}" == "0" ]]; then
    printf '%s: %s' "$level" "$msg"
    return 0
  fi
  if [[ -z "${TIED_OPERATOR_EPOCH_MS:-}" ]]; then
    operator_stderr_epoch_init || return 1
  fi
  off="$(_operator_stderr_offset)"
  printf '%s %s: %s' "$off" "$level" "$msg"
}

# Usage: operator_stderr_line DIAGNOSTIC "message body"
operator_stderr_line() {
  local level="$1"
  shift
  local msg="$*"
  local off plain

  if [[ "${AGENTSTREAM_OPERATOR_ELAPSED:-1}" == "0" ]]; then
    printf '%s: %s\n' "$level" "$msg" >&2
    return 0
  fi

  if [[ -z "${TIED_OPERATOR_EPOCH_MS:-}" ]]; then
    operator_stderr_epoch_init || return 1
  fi

  off="$(_operator_stderr_offset)"
  plain="${off} ${level}: ${msg}"

  if _operator_stderr_plain_mode; then
    printf '%s\n' "$plain" >&2
    return 0
  fi

  local _R=$'\033[0m' _D=$'\033[2m' _CY=$'\033[36m' _YL=$'\033[33m'
  if [[ "$level" == "DEBUG" ]]; then
    printf '%b%b%s%b %b%s%b:%b %s\n' "$_D" "$_CY" "$off" "$_R" "$_D" "$_YL" "$level" "$_R" "$msg" >&2
  else
    printf '%b%b%s%b %b%s:%b %s\n' "$_D" "$_CY" "$off" "$_R" "$_D" "$level" "$_R" "$msg" >&2
  fi
}