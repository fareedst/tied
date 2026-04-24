// Package config parses CLI arguments and resolves defaults (unified shell + Ruby runner).
// REQ: REQ-GOAGENT-CLI-CONFIG
// ARCH: ARCH-GOAGENT-CLI
// IMPL: IMPL-GOAGENT-CLI
package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Config is the fully resolved runtime configuration. REQ-GOAGENT-CLI-CONFIG.
type Config struct {
	DryRun               bool
	SessionID            string
	Workspace            string
	Model                string
	OrderFilterRaw       string
	LeadChecklistYAML    string
	LeadChecklistSkipSub bool
	// LeadChecklistStepFromID / LeadChecklistStepToID: inclusive main-step bounds by YAML step slug (--lead-checklist-*-step).
	LeadChecklistStepFromID     string
	LeadChecklistStepToID       string
	PromptFiles                 []string
	PromptsFiles                []string
	TddYAMLs                    []string
	FeatureSpecBatchYAMLs       []string
	PreviewFeatureSpecBatchYAML string
	VerifySession               bool
	ArgvWords                   []string
	AgentPath                   string
	MCPJSONPath                 string
	SkipTiedMCPPreflight        bool
	AssumeTiedMCPYes            bool
	// FirstTurn is 1-based index of the first turn to run after pipeline.Build (default 1). REQ-GOAGENT-CLI-CONFIG.
	FirstTurn int
	// ChecklistVars maps {{KEY}} placeholders when rendering --lead-checklist-yaml (repeatable --checklist-var KEY=VALUE).
	ChecklistVars map[string]string
	// ChecklistVarStrict errors if any {{NAME}} remains after substitution (CLI or AGENTSTREAM_CHECKLIST_VAR_STRICT=1).
	ChecklistVarStrict bool
	// LeadChecklistBeforeFeatureSpec: when set with both -b and -c, emit checklist turns before feature-spec turns.
	LeadChecklistBeforeFeatureSpec bool

	// skipWorkspacePreload: when true, do not prepend workspace tied/agent-preload-contract.yaml (for tests/tools).
	// Also: env AGENTSTREAM_SKIP_WORKSPACE_PRELOAD=1.
	skipWorkspacePreload bool

	featureSpecBatchExplicit  bool
	positionalFeatureSpecYAML string
	tiedMCPPreflightUserSet   bool
}

// FindRepoRoot walks parents from start looking for tied/docs/agent-req-implementation-checklist.yaml. REQ-GOAGENT-CLI-CONFIG.
func FindRepoRoot(start string) (string, bool) {
	dir := start
	for {
		p := filepath.Join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml")
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			return dir, true
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", false
}

func fileReadable(path string) bool {
	st, err := os.Stat(path)
	return err == nil && !st.IsDir() && isReadable(path)
}

func isReadable(path string) bool {
	f, err := os.Open(path)
	if err != nil {
		return false
	}
	_ = f.Close()
	return true
}

// ParseAndResolve parses os.Args[1:], resolves defaults from cwd, validates, returns Config. REQ-GOAGENT-CLI-CONFIG.
func ParseAndResolve(cwd string, args []string) (*Config, error) {
	c := &Config{Model: "Auto", Workspace: cwd}
	flagPart, argvWords, err := splitDoubleDash(args)
	if err != nil {
		return nil, err
	}
	c.ArgvWords = argvWords
	if err := parseFlags(flagPart, c); err != nil {
		return nil, err
	}
	if c.positionalFeatureSpecYAML != "" {
		if c.featureSpecBatchExplicit {
			return nil, fmt.Errorf("positional FEATURE_SPEC_BATCH_YAML cannot be used with --feature-spec-batch-yaml")
		}
		c.FeatureSpecBatchYAMLs = append([]string{c.positionalFeatureSpecYAML}, c.FeatureSpecBatchYAMLs...)
		c.featureSpecBatchExplicit = true
	}
	if err := resolveDefaults(cwd, c); err != nil {
		return nil, err
	}
	if err := validate(c); err != nil {
		return nil, err
	}
	return c, nil
}

func splitDoubleDash(args []string) (flags []string, after []string, err error) {
	for i, a := range args {
		if a == "--" {
			return append([]string(nil), args[:i]...), append([]string(nil), args[i+1:]...), nil
		}
	}
	return append([]string(nil), args...), nil, nil
}

func parseFlags(args []string, c *Config) error {
	var pos []string
	for i := 0; i < len(args); i++ {
		a := args[i]
		if a == "" {
			continue
		}
		if strings.HasPrefix(a, "-") {
			k, v, ok := splitEq(a)
			switch {
			case k == "-h" || k == "--help":
				return errHelp
			case k == "-d" || k == "--dry-run":
				c.DryRun = true
			case k == "--lead-checklist-skip-sub":
				c.LeadChecklistSkipSub = true
			case k == "--lead-checklist-before-feature":
				c.LeadChecklistBeforeFeatureSpec = true
			case k == "--verify-session":
				c.VerifySession = true
			case k == "-s" || k == "--session-id":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				if strings.TrimSpace(val) == "" {
					return fmt.Errorf("missing value for %s", k)
				}
				c.SessionID = val
			case k == "-f" || k == "--first-turn":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				val = strings.TrimSpace(val)
				if val == "" {
					return fmt.Errorf("missing value for %s", k)
				}
				n, err := strconv.Atoi(val)
				if err != nil || n < 1 {
					return fmt.Errorf("%s must be a positive integer", k)
				}
				c.FirstTurn = n
			case k == "-o" || k == "--select-order" || k == "--feature-spec-batch-order":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				if strings.TrimSpace(val) == "" {
					return fmt.Errorf("missing value for %s", k)
				}
				c.OrderFilterRaw = val
			case k == "-w" || k == "--workspace":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.Workspace = val
			case k == "-m" || k == "--model":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.Model = val
			case k == "-c" || k == "--lead-checklist-yaml":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.LeadChecklistYAML = val
			case k == "--lead-checklist-from-step":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.LeadChecklistStepFromID = val
			case k == "--lead-checklist-to-step":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.LeadChecklistStepToID = val
			case k == "-p" || k == "--prompt-file":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.PromptFiles = append(c.PromptFiles, val)
			case k == "--prompts-file":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.PromptsFiles = append(c.PromptsFiles, val)
			case k == "--tdd-yaml":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.TddYAMLs = append(c.TddYAMLs, val)
			case k == "-b" || k == "--feature-spec-batch-yaml":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.FeatureSpecBatchYAMLs = append(c.FeatureSpecBatchYAMLs, val)
				c.featureSpecBatchExplicit = true
			case k == "--preview-feature-spec-batch-yaml":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.PreviewFeatureSpecBatchYAML = val
			case k == "--agent-path":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.AgentPath = val
			case k == "--mcp-json":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				c.MCPJSONPath = val
			case k == "--skip-tied-mcp-preflight":
				c.SkipTiedMCPPreflight = true
				c.tiedMCPPreflightUserSet = true
			case k == "--tied-mcp-preflight":
				c.SkipTiedMCPPreflight = false
				c.tiedMCPPreflightUserSet = true
			case k == "-y" || k == "--yes":
				c.AssumeTiedMCPYes = true
			case k == "--skip-workspace-preload":
				c.skipWorkspacePreload = true
			case k == "--checklist-var" || k == "--lead-checklist-var":
				val, err := needVal(k, v, ok, args, &i)
				if err != nil {
					return err
				}
				key, value, cut := strings.Cut(val, "=")
				key = strings.TrimSpace(key)
				if !cut || key == "" {
					return fmt.Errorf("%s requires KEY=VALUE", k)
				}
				if c.ChecklistVars == nil {
					c.ChecklistVars = make(map[string]string)
				}
				c.ChecklistVars[key] = value
			case k == "--checklist-var-strict":
				c.ChecklistVarStrict = true
			default:
				return fmt.Errorf("unknown option: %s", k)
			}
			continue
		}
		pos = append(pos, a)
	}
	if len(pos) > 1 {
		return fmt.Errorf("unexpected extra arguments: %s", strings.Join(pos, " "))
	}
	if len(pos) == 1 {
		c.positionalFeatureSpecYAML = pos[0]
	}
	return nil
}

var errHelp = fmt.Errorf("help")

// IsHelp reports whether err is the sentinel from --help.
func IsHelp(err error) bool {
	return err == errHelp
}

func splitEq(a string) (key, val string, hasVal bool) {
	if i := strings.IndexByte(a, '='); i >= 0 {
		return a[:i], a[i+1:], true
	}
	return a, "", false
}

func needVal(flagKey string, inline string, hasInline bool, args []string, i *int) (string, error) {
	if hasInline {
		if inline == "" {
			return "", fmt.Errorf("missing value for %s", flagKey)
		}
		return inline, nil
	}
	if *i+1 >= len(args) {
		return "", fmt.Errorf("missing value for %s", flagKey)
	}
	next := args[*i+1]
	if strings.HasPrefix(next, "-") {
		return "", fmt.Errorf("missing value for %s", flagKey)
	}
	*i++
	return next, nil
}

func resolveDefaults(cwd string, c *Config) error {
	if c.Workspace == "" {
		c.Workspace = cwd
	}
	c.Workspace = filepath.Clean(c.Workspace)
	if c.LeadChecklistYAML == "" {
		if root, ok := FindRepoRoot(c.Workspace); ok {
			p := filepath.Join(root, "tied", "docs", "agent-req-implementation-checklist.yaml")
			if fileReadable(p) {
				c.LeadChecklistYAML = p
			}
		}
	}
	applyWorkspacePreloadDefault(c)
	if !c.featureSpecBatchExplicit {
		p := filepath.Join(c.Workspace, "prompts", "all.yaml")
		if fileReadable(p) {
			c.FeatureSpecBatchYAMLs = append([]string{p}, c.FeatureSpecBatchYAMLs...)
		}
	}
	if c.FirstTurn == 0 {
		c.FirstTurn = 1
	}
	if os.Getenv("AGENTSTREAM_CHECKLIST_VAR_STRICT") == "1" {
		c.ChecklistVarStrict = true
	}
	// Default: do not validate .cursor/mcp.json before cursor agent (opt in with --tied-mcp-preflight).
	if !c.tiedMCPPreflightUserSet {
		c.SkipTiedMCPPreflight = true
	}
	return nil
}

// applyWorkspacePreloadDefault prepends <workspace>/tied/agent-preload-contract.yaml when it exists
// and skip is not set, merging with explicit --prompt-file paths and deduplicating by cleaned path
// (workspace file always first). It falls back to the former workspace-root path for old checkouts. REQ-GOAGENT-CLI-CONFIG.
func applyWorkspacePreloadDefault(c *Config) {
	skip := c.skipWorkspacePreload || os.Getenv("AGENTSTREAM_SKIP_WORKSPACE_PRELOAD") == "1"
	def := filepath.Clean(filepath.Join(c.Workspace, "tied", "agent-preload-contract.yaml"))
	legacyDef := filepath.Clean(filepath.Join(c.Workspace, "agent-preload-contract.yaml"))
	seen := make(map[string]struct{})
	var out []string
	if !skip {
		if fileReadable(def) {
			seen[def] = struct{}{}
			out = append(out, def)
		} else if fileReadable(legacyDef) {
			seen[legacyDef] = struct{}{}
			out = append(out, legacyDef)
		}
	}
	for _, p := range c.PromptFiles {
		cp := filepath.Clean(p)
		if _, ok := seen[cp]; ok {
			continue
		}
		seen[cp] = struct{}{}
		out = append(out, p)
	}
	c.PromptFiles = out
}

func validate(c *Config) error {
	if c.PreviewFeatureSpecBatchYAML != "" {
		if !fileReadable(c.PreviewFeatureSpecBatchYAML) {
			return fmt.Errorf("preview file is not a readable file: %s", c.PreviewFeatureSpecBatchYAML)
		}
		return nil
	}
	st, err := os.Stat(c.Workspace)
	if err != nil || !st.IsDir() {
		return fmt.Errorf("workspace is not a directory: %s", c.Workspace)
	}
	for _, p := range c.PromptFiles {
		if !fileReadable(p) {
			return fmt.Errorf("prompt file is not a readable file: %s", p)
		}
	}
	for _, p := range c.PromptsFiles {
		if !fileReadable(p) {
			return fmt.Errorf("prompts file is not a readable file: %s", p)
		}
	}
	for _, p := range c.TddYAMLs {
		if !fileReadable(p) {
			return fmt.Errorf("tdd yaml is not a readable file: %s", p)
		}
	}
	for _, p := range c.FeatureSpecBatchYAMLs {
		if !fileReadable(p) {
			return fmt.Errorf("feature spec batch yaml is not a readable file: %s", p)
		}
	}
	if c.LeadChecklistYAML != "" && !fileReadable(c.LeadChecklistYAML) {
		return fmt.Errorf("lead checklist yaml is not a readable file: %s", c.LeadChecklistYAML)
	}
	hasStepBound := strings.TrimSpace(c.LeadChecklistStepFromID) != "" || strings.TrimSpace(c.LeadChecklistStepToID) != ""
	if hasStepBound && strings.TrimSpace(c.LeadChecklistYAML) == "" {
		return fmt.Errorf("--lead-checklist-from-step and --lead-checklist-to-step require --lead-checklist-yaml")
	}
	if strings.TrimSpace(c.OrderFilterRaw) != "" && len(c.FeatureSpecBatchYAMLs) == 0 {
		return fmt.Errorf("--feature-spec-batch-order requires at least one --feature-spec-batch-yaml PATH")
	}
	hasSource := len(c.ArgvWords) > 0 || len(c.PromptFiles) > 0 || len(c.PromptsFiles) > 0 ||
		len(c.TddYAMLs) > 0 || len(c.FeatureSpecBatchYAMLs) > 0 || c.LeadChecklistYAML != ""
	if !hasSource {
		return fmt.Errorf("no prompts: provide argv after --, --prompt-file, --prompts-file, --tdd-yaml, --feature-spec-batch-yaml, and/or --lead-checklist-yaml")
	}
	return nil
}

// UsageText is printed for --help. REQ-GOAGENT-CLI-CONFIG.
func UsageText(program string) string {
	return fmt.Sprintf(`Usage:
  %s [options] [--] [PROMPT_WORD]...

Options:
  -d, --dry-run
  -s, --session-id ID
  -f, --first-turn N     (1-based; N>1 requires --session-id for mid-batch resume)
  -o, --select-order ARG   (synonym: --feature-spec-batch-order; N or N-M)
  -w, --workspace PATH     (default: current directory)
  -m, --model MODEL        (default: Auto)
  -c, --lead-checklist-yaml PATH
      --lead-checklist-from-step ID-or-slug   (optional inclusive lower; main steps only)
      --lead-checklist-to-step ID-or-slug     (optional inclusive upper; main steps only)
      --lead-checklist-skip-sub
      --lead-checklist-before-feature
                    (with -b and -c: lead checklist steps before feature-spec records; default is feature-spec first)
      --checklist-var KEY=VALUE   (repeatable; synonym: --lead-checklist-var; expands {{KEY}} in lead checklist YAML)
      --checklist-var-strict      (error if any {{NAME}} remains after expansion; env: AGENTSTREAM_CHECKLIST_VAR_STRICT=1)
  -p, --prompt-file PATH   (repeatable; prepended on each new session, not a separate turn; merged with workspace preload)
      --skip-workspace-preload
                    skip prepending <workspace>/tied/agent-preload-contract.yaml (env: AGENTSTREAM_SKIP_WORKSPACE_PRELOAD=1)
      --prompts-file PATH  (repeatable)
      --tdd-yaml PATH      (repeatable)
  -b, --feature-spec-batch-yaml PATH (repeatable)
      --preview-feature-spec-batch-yaml PATH
      --verify-session
      --agent-path PATH    (default: agent on PATH)
      --mcp-json PATH      (explicit .cursor/mcp.json when multiple projects under --workspace)
      --tied-mcp-preflight validate .cursor/mcp.json for tied-yaml before cursor agent
                          (off by default; also: AGENTSTREAM_TIED_MCP_PREFLIGHT=1)
      --skip-tied-mcp-preflight
                          skip validation (default; also: AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1)
  -y, --yes              non-interactive: continue after tied-yaml preflight warnings/blocks
  -h, --help

Positional:
  FEATURE_SPEC_BATCH_YAML  (alternate to -b; cannot combine with -b)

Defaults when files exist:
  lead checklist: <repo>/tied/docs/agent-req-implementation-checklist.yaml
  prompt file:    <workspace>/tied/agent-preload-contract.yaml first, then any --prompt-file (prepended on new sessions; omit with --skip-workspace-preload)
  feature batch:  <workspace>/prompts/all.yaml
`, program)
}
