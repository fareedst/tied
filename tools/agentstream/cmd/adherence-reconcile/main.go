// Standalone CLI for read-only adherence chain reconciliation.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: EXPOSE_RECONCILE_OPERATOR_SURFACE delegates to ReconcileAdherenceChain and prints JSON to stdout.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	"stdd/agentstream/checklist"

	"gopkg.in/yaml.v3"
)

func main() {
	ledger := flag.String("ledger", "", "Path to agent-adherence-event.v1 JSONL ledger")
	tracker := flag.String("tracker", "", "Path to Authoritative Tracker YAML")
	gatesDir := flag.String("gates-dir", "", "Directory containing checklist-gate-receipt.v1 JSON files")
	workspace := flag.String("workspace", "", "Repository workspace root for evidence resolution")
	citdpPath := flag.String("citdp", "", "Optional CITDP YAML path")
	reqIndex := flag.String("requirements-index", "", "Optional requirements.yaml path")
	implIndex := flag.String("implementation-index", "", "Optional implementation-decisions.yaml path")
	flag.Parse()

	if strings.TrimSpace(*tracker) == "" {
		fmt.Fprintln(os.Stderr, "DIAGNOSTIC: --tracker is required")
		os.Exit(2)
	}

	ws := strings.TrimSpace(*workspace)
	if ws == "" {
		wd, err := os.Getwd()
		if err != nil {
			fmt.Fprintf(os.Stderr, "DIAGNOSTIC: workspace resolution failed: %v\n", err)
			os.Exit(2)
		}
		ws = wd
	}

	citdp, err := loadOptionalYAML(*citdpPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: citdp load failed: %v\n", err)
		os.Exit(2)
	}

	tiedIndexes := checklist.TiedIndexSnapshot{}
	if strings.TrimSpace(*reqIndex) != "" {
		doc, err := loadOptionalYAML(*reqIndex)
		if err != nil {
			fmt.Fprintf(os.Stderr, "DIAGNOSTIC: requirements index load failed: %v\n", err)
			os.Exit(2)
		}
		tiedIndexes.Requirements = doc
	}
	if strings.TrimSpace(*implIndex) != "" {
		doc, err := loadOptionalYAML(*implIndex)
		if err != nil {
			fmt.Fprintf(os.Stderr, "DIAGNOSTIC: implementation index load failed: %v\n", err)
			os.Exit(2)
		}
		tiedIndexes.Implementation = doc
	}

	report, err := checklist.ReconcileAdherenceChain(checklist.ReconcileInput{
		LedgerPath:  strings.TrimSpace(*ledger),
		TrackerPath: strings.TrimSpace(*tracker),
		CITDP:       citdp,
		GatesDir:    strings.TrimSpace(*gatesDir),
		Workspace:   ws,
		TiedIndexes: tiedIndexes,
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: reconcile failed: %v\n", err)
		os.Exit(2)
	}
	report.ReadOnly = true

	body, err := json.Marshal(report)
	if err != nil {
		fmt.Fprintf(os.Stderr, "DIAGNOSTIC: json marshal failed: %v\n", err)
		os.Exit(2)
	}
	fmt.Println(string(body))
}

func loadOptionalYAML(path string) (map[string]interface{}, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return map[string]interface{}{}, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("yaml_not_readable: %w", err)
	}
	var doc map[string]interface{}
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, fmt.Errorf("invalid_yaml: %w", err)
	}
	return doc, nil
}
