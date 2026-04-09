// Command agentstream drives the Cursor agent CLI with multi-turn YAML prompts.
// REQ: REQ-GOAGENT-CLI-CONFIG, REQ-GOAGENT-PIPELINE, REQ-GOAGENT-EXECUTOR
// ARCH: ARCH-GOAGENT-CLI, ARCH-GOAGENT-PIPELINE
// IMPL: IMPL-GOAGENT-CMD
package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"golang.org/x/term"

	"stdd/agentstream"
	"stdd/agentstream/config"
	"stdd/agentstream/executor"
	"stdd/agentstream/featurespec"
	"stdd/agentstream/pipeline"
	"stdd/agentstream/tiedpreflight"
)

func main() {
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
		os.Exit(2)
	}
	cfg, err := config.ParseAndResolve(cwd, os.Args[1:])
	if err != nil {
		if config.IsHelp(err) {
			fmt.Print(config.UsageText(os.Args[0]))
			os.Exit(0)
		}
		fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
		os.Exit(2)
	}

	if cfg.PreviewFeatureSpecBatchYAML != "" {
		var fo *featurespec.OrderFilter
		if strings.TrimSpace(cfg.OrderFilterRaw) != "" {
			fo, err = featurespec.ParseOrderFilter(cfg.OrderFilterRaw)
			if err != nil {
				fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
				os.Exit(1)
			}
		}
		opts := &featurespec.Options{OrderFilter: fo}
		if err := featurespec.Preview(cfg.PreviewFeatureSpecBatchYAML, opts, os.Stdout); err != nil {
			fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
			os.Exit(1)
		}
		os.Exit(0)
	}

	if cfg.DryRun {
		_ = os.Stdout.Sync()
	}

	var fo *featurespec.OrderFilter
	if strings.TrimSpace(cfg.OrderFilterRaw) != "" {
		fo, err = featurespec.ParseOrderFilter(cfg.OrderFilterRaw)
		if err != nil {
			fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
			os.Exit(1)
		}
	}

	turns, err := pipeline.Build(pipeline.Input{
		ArgvWords:                 cfg.ArgvWords,
		PromptFiles:               cfg.PromptFiles,
		PromptsFiles:              cfg.PromptsFiles,
		TddYAMLPaths:              cfg.TddYAMLs,
		FeatureSpecBatchYAMLPaths: cfg.FeatureSpecBatchYAMLs,
		FeatureSpecOpts:           &featurespec.Options{OrderFilter: fo},
		LeadChecklistYAML:         cfg.LeadChecklistYAML,
		LeadChecklistSkipSub:      cfg.LeadChecklistSkipSub,
		LeadChecklistStepFromID:   cfg.LeadChecklistStepFromID,
		LeadChecklistStepToID:     cfg.LeadChecklistStepToID,
		VerifySession:             cfg.VerifySession,
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
		os.Exit(1)
	}

	originalTotal := len(turns)
	if cfg.FirstTurn > 1 && strings.TrimSpace(cfg.SessionID) == "" {
		fmt.Fprintf(os.Stderr, "agentstream: --first-turn > 1 requires --session-id\n")
		os.Exit(1)
	}
	turns, err = pipeline.SliceFromFirstTurn(turns, cfg.FirstTurn)
	if err != nil {
		fmt.Fprintf(os.Stderr, "agentstream: %v\n", err)
		os.Exit(1)
	}

	chain := pipeline.ChainBetween(turns)
	if code := runTiedPreflight(cfg); code != 0 {
		os.Exit(code)
	}
	if cfg.DryRun {
		runDryRun(cfg, turns, chain, cfg.FirstTurn, originalTotal)
		os.Exit(0)
	}

	ctx := context.Background()
	running := ""
	for i, t := range turns {
		sess := pipeline.SessionForTurn(i, cfg.SessionID, chain, running)
		label := " (new session)"
		if sess != "" {
			label = fmt.Sprintf(" (resume %s)", sess)
		}
		fmt.Fprintf(os.Stderr, "\n--- turn %d/%d%s ---\n", cfg.FirstTurn+i, originalTotal, label)

		argv := executor.AgentArgv(cfg.AgentPath, cfg.Workspace, cfg.Model, sess, t.Parts)
		sid, code, err := executor.Run(ctx, argv, os.Stdout, os.Stderr)
		if err != nil {
			if code != 0 {
				os.Exit(code)
			}
			os.Exit(1)
		}
		if sid == "" {
			fmt.Fprintf(os.Stderr, "No session_id in stream; cannot continue with --resume\n")
			os.Exit(1)
		}
		fmt.Fprintf(os.Stderr, "session_id=%s\n", sid)
		running = string(sid)
	}
}

func runDryRun(cfg *config.Config, turns []agentstream.Turn, chain []bool, firstTurn, originalTotal int) {
	displaySession := cfg.SessionID
	for i, t := range turns {
		sess := pipeline.SessionForTurn(i, cfg.SessionID, chain, displaySession)
		label := " (new session)"
		if sess != "" {
			label = fmt.Sprintf(" (resume %s)", sess)
		}
		fmt.Fprintf(os.Stderr, "\n--- turn %d/%d%s ---\n", firstTurn+i, originalTotal, label)

		n := len(t.Parts)
		for j, p := range t.Parts {
			fmt.Printf("--- argv part %d/%d ---\n", j+1, n)
			fmt.Println(p)
		}
		argv := executor.AgentArgv(cfg.AgentPath, cfg.Workspace, cfg.Model, sess, t.Parts)
		fmt.Printf("command: %s\n", formatShellArgv(argv))
		if i == 0 && len(turns) > 1 {
			fmt.Fprintf(os.Stderr, "dry-run: chained turns use --resume with the session_id from the previous turn; each "+
				"--feature-spec-batch-yaml record after a prior turn omits --resume (new session). "+
				"An initial --session-id only applies to turn 1.\n")
		}
		if i < len(chain) && chain[i] {
			displaySession = "<session_id_from_previous_turn>"
		}
	}
}

func formatShellArgv(argv []string) string {
	var b strings.Builder
	for i, a := range argv {
		if i > 0 {
			b.WriteByte(' ')
		}
		b.WriteString(strconv.Quote(a))
	}
	return b.String()
}

// runTiedPreflight validates .cursor/mcp.json before invoking cursor agent (REQ-GOAGENT-CLI-CONFIG).
func runTiedPreflight(cfg *config.Config) int {
	if cfg.SkipTiedMCPPreflight || os.Getenv("AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT") == "1" {
		return 0
	}
	res, err := tiedpreflight.Run(cfg.Workspace, cfg.MCPJSONPath)
	if err != nil {
		return tiedPreflightLocateFailure(cfg, err)
	}
	printTiedPreflightReport(res)
	switch res.Status {
	case tiedpreflight.StatusOK:
		return 0
	case tiedpreflight.StatusWarning:
		return tiedPreflightConfirm(cfg, true, "Warnings above. Proceed without addressing them? [y/N] ")
	case tiedpreflight.StatusBlocked:
		return tiedPreflightConfirm(cfg, false, "tied-yaml MCP config is missing or unsafe. Continue anyway? [y/N] ")
	default:
		return 0
	}
}

func tiedPreflightLocateFailure(cfg *config.Config, err error) int {
	if errors.Is(err, tiedpreflight.ErrNotFound) {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: tied-yaml preflight: no .cursor/mcp.json under workspace %s\n", cfg.Workspace)
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: fix: run copy_files.sh on the client project, or pass --mcp-json PATH to a specific mcp.json\n")
		if cfg.DryRun {
			fmt.Fprintf(os.Stderr, "DEBUG: dry-run: would prompt or exit non-zero (use -y or --skip-tied-mcp-preflight to bypass)\n")
			return 0
		}
		if cfg.AssumeTiedMCPYes {
			fmt.Fprintf(os.Stderr, "DIAGNOSTIC: continuing because -y / --yes was set\n")
			return 0
		}
		if term.IsTerminal(int(os.Stdin.Fd())) {
			if promptYesNo(os.Stdin, os.Stderr, "No tied-yaml MCP config found. Continue anyway? [y/N] ") {
				return 0
			}
			return 1
		}
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: non-interactive session: exiting (use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1)\n")
		return 1
	}
	var amb *tiedpreflight.ErrAmbiguous
	if errors.As(err, &amb) {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: %s\n", err)
		if cfg.DryRun {
			fmt.Fprintf(os.Stderr, "DEBUG: dry-run: would exit non-zero (pass --mcp-json PATH)\n")
			return 0
		}
		// Never guess which project; -y does not override ambiguity.
		return 1
	}
	fmt.Fprintf(os.Stderr, "DIAGNOSTIC: tied-yaml preflight: %v\n", err)
	if cfg.DryRun {
		return 0
	}
	return 1
}

func printTiedPreflightReport(res *tiedpreflight.Result) {
	fmt.Fprintf(os.Stderr, "DEBUG: tied-yaml preflight: mcp.json=%s TIED_BASE_PATH=%q status=%d\n",
		res.MCPJSONPath, res.TIEDBasePath, res.Status)
	for _, e := range res.Errors {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: tied-yaml preflight error: %s\n", e)
	}
	for _, w := range res.Warnings {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: tied-yaml preflight warning: %s\n", w)
	}
	fmt.Fprintf(os.Stderr, "DIAGNOSTIC: %s\n", res.RuntimeNotice)
}

func tiedPreflightConfirm(cfg *config.Config, warningOnly bool, question string) int {
	if cfg.DryRun {
		fmt.Fprintf(os.Stderr, "DEBUG: dry-run: would prompt: %s (use -y or --skip-tied-mcp-preflight to bypass)\n", strings.TrimSpace(question))
		return 0
	}
	if cfg.AssumeTiedMCPYes {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: continuing because -y / --yes was set\n")
		return 0
	}
	if warningOnly {
		// Warnings-only: allow CI/non-TTY to proceed after printing diagnostics.
		if !term.IsTerminal(int(os.Stdin.Fd())) {
			return 0
		}
	} else {
		if !term.IsTerminal(int(os.Stdin.Fd())) {
			fmt.Fprintf(os.Stderr, "DIAGNOSTIC: non-interactive session: exiting (use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1)\n")
			return 1
		}
	}
	if promptYesNo(os.Stdin, os.Stderr, question) {
		return 0
	}
	return 1
}

func promptYesNo(in *os.File, errOut *os.File, question string) bool {
	fmt.Fprint(errOut, question)
	line, err := bufio.NewReader(in).ReadString('\n')
	if err != nil {
		return false
	}
	s := strings.ToLower(strings.TrimSpace(line))
	return s == "y" || s == "yes"
}
