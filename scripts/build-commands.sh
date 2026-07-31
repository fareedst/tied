# build-commands.sh

# echo_exec

if ! command -v echo_exec >/dev/null 2>&1; then
  echo_exec() {
    local dir=

    case ${1-} in
      --cd)
        [[ $# -ge 3 && -n ${2-} ]] || return 2
        dir=$2
        shift 2
        ;;
      --cd=*)
        dir=${1#--cd=}
        [[ -n $dir ]] || return 2
        shift
        ;;
      --)
        shift
        ;;
    esac

    [[ $# -gt 0 ]] || return 2

    if [[ -n $dir ]]; then
      (
        cd -- "$dir" || exit $?
        "$@"
      )
    else
      "$@"
    fi
  }
fi

export ECHO_EXEC_CMD=1
export ECHO_EXEC_TIME=1
export ECHO_EXEC_TIME_UTC='%H:%M:%S'

# bkpdir

alias bi='bkpdir inc'
alias b.='bkpdir .'

# TIED

alias tied-cli=.cursor/skills/tied-yaml/scripts/tied-cli.sh

lint-tied () {
  scripts/lint_yaml.sh -F tied
}
alias lint-reorder=scripts/lint.sh

alias build-agentstream='echo_exec --cd tools/agentstream go build -o agentstream ./cmd/agentstream'
alias build-mcp='echo_exec --cd mcp-server bun install && echo_exec --cd mcp-server bun run build'
alias test-mcp='echo_exec --cd mcp-server bun run test'
