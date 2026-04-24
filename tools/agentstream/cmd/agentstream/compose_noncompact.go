// Post-preload non-compact HTML transform [PROC-AGENT_REQ_CHECKLIST] composition edge.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
// [IMPL-GOAGENT-CLI-CMD] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG] — MAP Config → INTEGRATE_WITH_MAIN (pseudocode MAP_CONFIG_TO_HTMLFORMAT_OPTIONS + INTEGRATE_WITH_MAIN).
package main

import (
	"stdd/agentstream"
	"stdd/agentstream/config"
	"stdd/agentstream/htmlformat"
)

// applyPostPreloadNonCompactHTML runs MAP_CONFIG_TO_HTMLFORMAT_OPTIONS then INTEGRATE_WITH_MAIN per IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT; must be called only after pipeline.ApplyPromptFilePreload, before preflight/executor. Does not start the UI.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG]
func applyPostPreloadNonCompactHTML(cfg *config.Config, turns []agentstream.Turn) error {
	if cfg == nil {
		return nil
	}
	ic := &htmlformat.CfgForIntegrate{NonCompactHTML: cfg.NonCompactHTML}
	o := htmlformat.Options{Enabled: cfg.NonCompactHTML, StableIndent: cfg.NonCompactHTMLStableIndent}
	// How: single composition call into htmlformat.IntegrateWithMain; trigger = cfg, effect = in-place Part strings.
	return htmlformat.IntegrateWithMain(ic, turns, o)
}
