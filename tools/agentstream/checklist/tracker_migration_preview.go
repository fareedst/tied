// Read-only Tracker migration preview comparing definition slug inventory to existing Tracker.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: PREVIEW_TRACKER_MIGRATION emits tracker-migration-preview.v1 without mutating Tracker bytes.
package checklist

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

const trackerMigrationPreviewSchema = "tracker-migration-preview.v1"

const staleReasonStepRemoved = "step_removed_from_definition"

// StaleDisposition flags a Tracker row whose slug no longer exists in the definition.
type StaleDisposition struct {
	Slug        string `json:"slug"`
	Disposition string `json:"disposition"`
	Reason      string `json:"reason"`
}

// TrackerMigrationPreviewReport is the read-only slug diff between definition and Tracker.
type TrackerMigrationPreviewReport struct {
	SchemaVersion         string             `json:"schema_version"`
	DefinitionPath        string             `json:"definition_path"`
	TrackerPath           string             `json:"tracker_path"`
	ReadOnly              bool               `json:"read_only"`
	DefinitionSlugs       []string           `json:"definition_slugs"`
	TrackerSlugs          []string           `json:"tracker_slugs"`
	MissingInTracker      []string           `json:"missing_in_tracker"`
	ExtraInTracker        []string           `json:"extra_in_tracker"`
	StaleDispositions     []StaleDisposition `json:"stale_dispositions"`
	WouldMaterializeFresh bool               `json:"would_materialize_fresh"`
}

// DefinitionStepSlugs returns the slug inventory MaterializeAuthoritativeTracker would use.
func DefinitionStepSlugs(definitionPath string) ([]string, error) {
	data, err := os.ReadFile(definitionPath)
	if err != nil {
		return nil, fmt.Errorf("definition_not_readable: %w", err)
	}
	var doc yamlDoc
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, fmt.Errorf("invalid_definition: %w", err)
	}
	if doc.Steps == nil {
		return nil, fmt.Errorf("invalid_definition: missing steps in %s", definitionPath)
	}
	if err := validateStepsHaveSlugs(doc.Steps, definitionPath); err != nil {
		return nil, err
	}
	if err := validateDuplicateSlugs(doc.Steps, definitionPath); err != nil {
		return nil, fmt.Errorf("duplicate_slug: %w", err)
	}
	hasGateSub := false
	for _, sub := range doc.SubProcedures {
		if strings.TrimSpace(sub.Slug) == GateSubProcedureSlug {
			hasGateSub = true
			break
		}
	}
	if !hasGateSub {
		return nil, fmt.Errorf("missing_gate_sub_procedure: %q not found in sub_procedures", GateSubProcedureSlug)
	}

	slugs := make([]string, 0, len(doc.Steps)+1)
	seen := make(map[string]struct{}, len(doc.Steps)+1)
	for _, step := range doc.Steps {
		slug := strings.TrimSpace(step.Slug)
		if _, ok := seen[slug]; ok {
			return nil, fmt.Errorf("duplicate_slug: %q", slug)
		}
		seen[slug] = struct{}{}
		slugs = append(slugs, slug)
	}
	if _, ok := seen[GateSubProcedureSlug]; !ok {
		slugs = append(slugs, GateSubProcedureSlug)
	}
	return slugs, nil
}

// TrackerStepDispositions returns slug→disposition map from a Tracker document.
func TrackerStepDispositions(tracker map[string]interface{}) map[string]string {
	out := make(map[string]string)
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return out
	}
	for _, item := range stepsRaw {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		slug, _ := row["slug"].(string)
		slug = strings.TrimSpace(slug)
		if slug == "" {
			continue
		}
		disp, _ := row["disposition"].(string)
		out[slug] = strings.TrimSpace(disp)
	}
	return out
}

// PreviewTrackerMigration compares definition and Tracker slug inventories without writing Tracker.
func PreviewTrackerMigration(definitionPath, trackerPath string) (TrackerMigrationPreviewReport, error) {
	report := TrackerMigrationPreviewReport{
		SchemaVersion:         trackerMigrationPreviewSchema,
		DefinitionPath:        filepath.Clean(definitionPath),
		TrackerPath:           filepath.Clean(trackerPath),
		ReadOnly:              true,
		WouldMaterializeFresh: false,
	}
	if err := RefuseDefinitionAsTracker(definitionPath, trackerPath); err != nil {
		return report, err
	}
	defSlugs, err := DefinitionStepSlugs(definitionPath)
	if err != nil {
		return report, err
	}
	report.DefinitionSlugs = append([]string(nil), defSlugs...)

	tracker, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		return report, fmt.Errorf("tracker_not_readable: %w", err)
	}
	trackSlugs := TrackerStepSlugs(tracker)
	report.TrackerSlugs = append([]string(nil), trackSlugs...)

	defSet := slugSet(defSlugs)
	trackSet := slugSet(trackSlugs)
	report.MissingInTracker = sortedSetDiff(defSet, trackSet)
	report.ExtraInTracker = sortedSetDiff(trackSet, defSet)

	dispositions := TrackerStepDispositions(tracker)
	for _, slug := range report.ExtraInTracker {
		disp := dispositions[slug]
		if disp == "" || disp == "pending" {
			continue
		}
		report.StaleDispositions = append(report.StaleDispositions, StaleDisposition{
			Slug:        slug,
			Disposition: disp,
			Reason:      staleReasonStepRemoved,
		})
	}
	sort.Slice(report.StaleDispositions, func(i, j int) bool {
		return report.StaleDispositions[i].Slug < report.StaleDispositions[j].Slug
	})
	return report, nil
}

func slugSet(slugs []string) map[string]struct{} {
	out := make(map[string]struct{}, len(slugs))
	for _, slug := range slugs {
		out[slug] = struct{}{}
	}
	return out
}

func sortedSetDiff(from, subtract map[string]struct{}) []string {
	out := make([]string, 0)
	for slug := range from {
		if _, ok := subtract[slug]; ok {
			continue
		}
		out = append(out, slug)
	}
	sort.Strings(out)
	return out
}
