// Wave 5 process adherence grade extension for RECONCILE_ADHERENCE_CHAIN.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
package checklist

import (
	"os"
	"path/filepath"
	"strings"
)

// ProcessGradeDimension is one weighted rubric dimension.
type ProcessGradeDimension struct {
	Name     string   `json:"name"`
	Score    float64  `json:"score"`
	Weight   float64  `json:"weight"`
	GapCodes []string `json:"gap_codes,omitempty"`
}

// ProcessGrade summarizes process contract adherence (0–100, band A–D).
type ProcessGrade struct {
	Score      float64                 `json:"score"`
	Band       string                  `json:"band"`
	Dimensions []ProcessGradeDimension `json:"dimensions"`
	GapCodes   []string                `json:"gap_codes"`
}

func processGradeBand(score float64) string {
	switch {
	case score >= 90:
		return "A"
	case score >= 75:
		return "B"
	case score >= 60:
		return "C"
	default:
		return "D"
	}
}

func completedSlugs(tracker map[string]interface{}) []string {
	ee, ok := tracker["execution_evidence"].(map[string]interface{})
	if !ok {
		return nil
	}
	raw, ok := ee["completed"].([]interface{})
	if !ok {
		return nil
	}
	out := make([]string, 0, len(raw))
	for _, item := range raw {
		if slug, ok := item.(string); ok && strings.TrimSpace(slug) != "" {
			out = append(out, strings.TrimSpace(slug))
		}
	}
	return out
}

func stepDisposition(step map[string]interface{}) string {
	if v, ok := step["disposition"].(string); ok && strings.TrimSpace(v) != "" {
		return strings.TrimSpace(v)
	}
	if v, ok := step["status"].(string); ok && strings.TrimSpace(v) != "" {
		return strings.TrimSpace(v)
	}
	if tracking, ok := step["tracking"].(map[string]interface{}); ok {
		if v, ok := tracking["status"].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
		if v, ok := tracking["disposition"].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

func hasNonPendingDisposition(tracker map[string]interface{}, slug string) bool {
	steps := trackerStepsFromMap(tracker)
	for _, step := range steps {
		stepSlug, _ := step["slug"].(string)
		if stepSlug == "" {
			stepSlug, _ = step["id"].(string)
		}
		if stepSlug != slug {
			continue
		}
		disp := stepDisposition(step)
		return disp == "completed" || disp == "not_applicable" || disp == "waived"
	}
	return false
}

func manifestPresent(workspace, requestToken string) bool {
	if strings.TrimSpace(workspace) == "" || strings.TrimSpace(requestToken) == "" {
		return false
	}
	manifest := filepath.Join(workspace, "working", requestToken, "evidence", "verification-evidence-manifest.v1.json")
	if _, err := os.Stat(manifest); err == nil {
		return true
	}
	naReceipt := filepath.Join(workspace, "working", requestToken, "evidence", "not-applicable-receipt.v1.json")
	_, err := os.Stat(naReceipt)
	return err == nil
}

func needsManifest(completed []string) bool {
	triggers := map[string]struct{}{
		"verification-gate":       {},
		"unit-test-green":         {},
		"unit-test-red":           {},
		"composition-integration": {},
	}
	for _, slug := range completed {
		if _, ok := triggers[slug]; ok {
			return true
		}
	}
	return false
}

func findingCodes(report ReconcileReport) map[string]int {
	counts := map[string]int{}
	for _, finding := range report.Findings {
		counts[finding.Code]++
	}
	return counts
}

// ComputeProcessGrade derives weighted process grade from tracker + reconcile findings.
func ComputeProcessGrade(input ReconcileInput, report ReconcileReport) ProcessGrade {
	tracker, _ := loadTracker(input)
	completed := completedSlugs(tracker)
	codes := findingCodes(report)
	gapCodes := make([]string, 0)

	dualWriteCount := 0
	for _, slug := range completed {
		if !hasNonPendingDisposition(tracker, slug) {
			dualWriteCount++
			gapCodes = append(gapCodes, "tracker_dual_write")
		}
	}
	trackerScore := 100.0
	if len(completed) > 0 {
		trackerScore = 100.0 * float64(len(completed)-dualWriteCount) / float64(len(completed))
	}
	if dualWriteCount == len(completed) && len(completed) > 0 {
		gapCodes = append(gapCodes, "tracker_sparse")
		trackerScore = 0
	}

	manifestScore := 100.0
	if needsManifest(completed) {
		if !manifestPresent(input.Workspace, trackerRequestToken(tracker)) {
			manifestScore = 0
			gapCodes = append(gapCodes, "expected_artifact_missing")
		}
	}

	hashScore := 100.0
	if codes[findingGateWithoutCurrentEvidence] > 0 {
		hashScore = 40
		gapCodes = append(gapCodes, "evidence_stale")
	}

	ledgerScore := 100.0
	if codes[findingLegacyNoAdherenceChain] > 0 {
		ledgerScore = 20
		gapCodes = append(gapCodes, "thin_ledger")
	} else if codes[findingAttemptWithoutVerified] > 0 {
		ledgerScore = 50
		gapCodes = append(gapCodes, "thin_ledger")
	}

	evidenceScore := 100.0
	if codes[findingCompletedWithUnresolved] > 0 {
		evidenceScore = 40
	}

	dimensions := []ProcessGradeDimension{
		{Name: "tracker_integrity", Score: trackerScore, Weight: 0.30, GapCodes: uniqueStrings(filterGapPrefix(gapCodes, "tracker_"))},
		{Name: "verification_manifest", Score: manifestScore, Weight: 0.25, GapCodes: filterGapPrefix(gapCodes, "expected_artifact_missing")},
		{Name: "hash_alignment", Score: hashScore, Weight: 0.20, GapCodes: filterGapPrefix(gapCodes, "evidence_stale")},
		{Name: "ledger_correlation", Score: ledgerScore, Weight: 0.15, GapCodes: filterGapPrefix(gapCodes, "thin_ledger")},
		{Name: "typed_evidence_refs", Score: evidenceScore, Weight: 0.10},
	}

	weighted := 0.0
	for _, dim := range dimensions {
		weighted += dim.Score * dim.Weight
	}

	return ProcessGrade{
		Score:      weighted,
		Band:       processGradeBand(weighted),
		Dimensions: dimensions,
		GapCodes:   uniqueStrings(gapCodes),
	}
}

func filterGapPrefix(gaps []string, code string) []string {
	for _, gap := range gaps {
		if gap == code {
			return []string{code}
		}
	}
	return nil
}

func uniqueStrings(items []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(items))
	for _, item := range items {
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		out = append(out, item)
	}
	return out
}
