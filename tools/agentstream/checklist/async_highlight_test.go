package checklist

import (
	"strings"
	"testing"
)

// [REQ-TIED_ASYNC_METHODOLOGY] W6 — agentstream highlights Phase B and Phase G async columns.
func TestLoadTurns_asyncMethodologyHighlightForPhaseBAndG(t *testing.T) {
	canonical := findCanonicalChecklist(t)

	phaseB, err := LoadTurns(canonical, Options{StepFromID: "catalog-pseudocode-contracts", StepToID: "catalog-pseudocode-contracts"})
	if err != nil {
		t.Fatal(err)
	}
	bodyB := strings.Join(MessagesFromTurns(phaseB), "\n")
	for _, needle := range []string{
		"Async methodology highlight (Phase B)",
		"catalog-async-boundaries",
		"not race-freedom",
	} {
		if !strings.Contains(bodyB, needle) {
			t.Fatalf("Phase B highlight missing %q", needle)
		}
	}

	phaseG, err := LoadTurns(canonical, Options{StepFromID: "composition-integration", StepToID: "composition-integration"})
	if err != nil {
		t.Fatal(err)
	}
	bodyG := strings.Join(MessagesFromTurns(phaseG), "\n")
	for _, needle := range []string{
		"Async methodology highlight (Phase G)",
		"async_semantics",
		"CONTROLLED_COMPOSITION_FAULT",
		"binding exercised",
	} {
		if !strings.Contains(bodyG, needle) {
			t.Fatalf("Phase G highlight missing %q", needle)
		}
	}
}
