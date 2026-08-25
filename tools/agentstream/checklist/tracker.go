// Package checklist Tracker materialization for Authoritative Tracker state.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: MATERIALIZE_AUTHORITATIVE_TRACKER converts read-only checklist definition into per-request state.
package checklist

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	// TrackerSchemaVersion is the Authoritative Tracker schema identifier.
	TrackerSchemaVersion = "checklist-tracker.v1"
	// GateSubProcedureSlug must appear as a top-level Tracker steps row.
	GateSubProcedureSlug = "sub-adversarial-inquiry-pass"
)

// MaterializeOptions configures Authoritative Tracker creation.
type MaterializeOptions struct {
	RequestToken string
	Name         string
}

// RefuseDefinitionAsTracker returns an error when trackerPath targets the checklist definition.
func RefuseDefinitionAsTracker(definitionPath, trackerPath string) error {
	def, err := filepath.Abs(filepath.Clean(definitionPath))
	if err != nil {
		return err
	}
	track, err := filepath.Abs(filepath.Clean(trackerPath))
	if err != nil {
		return err
	}
	if def == track {
		return fmt.Errorf("tracker path must not equal checklist definition path: %s", def)
	}
	return nil
}

// MaterializeAuthoritativeTracker writes a clean per-request Tracker from the checklist definition.
func MaterializeAuthoritativeTracker(definitionPath, trackerPath string, opts MaterializeOptions) error {
	if err := RefuseDefinitionAsTracker(definitionPath, trackerPath); err != nil {
		return err
	}
	data, err := os.ReadFile(definitionPath)
	if err != nil {
		return fmt.Errorf("definition_not_readable: %w", err)
	}
	var doc yamlDoc
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return fmt.Errorf("invalid_definition: %w", err)
	}
	if doc.Steps == nil {
		return fmt.Errorf("invalid_definition: missing steps in %s", definitionPath)
	}
	if err := validateStepsHaveSlugs(doc.Steps, definitionPath); err != nil {
		return err
	}
	if err := validateDuplicateSlugs(doc.Steps, definitionPath); err != nil {
		return fmt.Errorf("duplicate_slug: %w", err)
	}
	hasGateSub := false
	for _, sub := range doc.SubProcedures {
		if strings.TrimSpace(sub.Slug) == GateSubProcedureSlug {
			hasGateSub = true
			break
		}
	}
	if !hasGateSub {
		return fmt.Errorf("missing_gate_sub_procedure: %q not found in sub_procedures", GateSubProcedureSlug)
	}

	steps := make([]map[string]interface{}, 0, len(doc.Steps)+1)
	seen := make(map[string]struct{}, len(doc.Steps)+1)
	for _, step := range doc.Steps {
		slug := strings.TrimSpace(step.Slug)
		if _, ok := seen[slug]; ok {
			return fmt.Errorf("duplicate_slug: %q", slug)
		}
		seen[slug] = struct{}{}
		steps = append(steps, pendingStepRow(slug, "main"))
	}
	if _, ok := seen[GateSubProcedureSlug]; !ok {
		steps = append(steps, pendingStepRow(GateSubProcedureSlug, "sub_procedure"))
	}

	name := strings.TrimSpace(opts.Name)
	if name == "" {
		name = strings.TrimSpace(doc.Name)
	}
	tracker := map[string]interface{}{
		"schema_version":  TrackerSchemaVersion,
		"source_document": filepath.Clean(definitionPath),
		"steps":           steps,
		"execution_evidence": map[string]interface{}{
			"completed": []interface{}{},
			"request":   strings.TrimSpace(opts.RequestToken),
		},
		"state_history": []interface{}{},
	}
	if name != "" {
		tracker["name"] = name
	}
	if strings.TrimSpace(opts.RequestToken) != "" {
		tracker["request_token"] = strings.TrimSpace(opts.RequestToken)
	}
	return atomicWriteYAML(trackerPath, tracker)
}

func pendingStepRow(slug, kind string) map[string]interface{} {
	return map[string]interface{}{
		"slug":        slug,
		"kind":        kind,
		"disposition": "pending",
	}
}

// LoadTrackerYAML reads a Tracker file into a generic map preserving unrelated fields.
func LoadTrackerYAML(path string) (map[string]interface{}, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var doc map[string]interface{}
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, fmt.Errorf("malformed_tracker: %w", err)
	}
	return doc, nil
}

// ValidateTrackerIdentity ensures an existing Tracker matches the current definition and request.
func ValidateTrackerIdentity(tracker map[string]interface{}, definitionPath, requestToken string) error {
	if tracker == nil {
		return fmt.Errorf("malformed_tracker")
	}
	wantSource := filepath.Clean(definitionPath)
	gotSource, _ := tracker["source_document"].(string)
	if strings.TrimSpace(gotSource) != "" && filepath.Clean(gotSource) != wantSource {
		return fmt.Errorf("tracker source_document mismatch: got %q want %q", gotSource, wantSource)
	}
	if strings.TrimSpace(requestToken) == "" {
		return nil
	}
	gotReq, _ := tracker["request_token"].(string)
	if strings.TrimSpace(gotReq) == "" {
		if ee, ok := tracker["execution_evidence"].(map[string]interface{}); ok {
			gotReq, _ = ee["request"].(string)
		}
	}
	if strings.TrimSpace(gotReq) != "" && strings.TrimSpace(gotReq) != strings.TrimSpace(requestToken) {
		return fmt.Errorf("tracker request_token mismatch: got %q want %q", gotReq, requestToken)
	}
	return nil
}

// EnsureTracker materializes when missing or validates identity when present.
func EnsureTracker(definitionPath, trackerPath, requestToken string) error {
	if err := RefuseDefinitionAsTracker(definitionPath, trackerPath); err != nil {
		return err
	}
	if _, err := os.Stat(trackerPath); os.IsNotExist(err) {
		return MaterializeAuthoritativeTracker(definitionPath, trackerPath, MaterializeOptions{RequestToken: requestToken})
	}
	tracker, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		return err
	}
	return ValidateTrackerIdentity(tracker, definitionPath, requestToken)
}

// TrackerStepSlugs returns ordered slug list from a Tracker map.
func TrackerStepSlugs(tracker map[string]interface{}) []string {
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return nil
	}
	out := make([]string, 0, len(stepsRaw))
	for _, item := range stepsRaw {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		slug, _ := row["slug"].(string)
		slug = strings.TrimSpace(slug)
		if slug != "" {
			out = append(out, slug)
		}
	}
	return out
}

// CopyHygieneClearsInheritedState reports whether materialized tracker has clean pending state.
func CopyHygieneClearsInheritedState(tracker map[string]interface{}) bool {
	if tracker == nil {
		return false
	}
	if sv, _ := tracker["schema_version"].(string); sv != TrackerSchemaVersion {
		return false
	}
	if ee, ok := tracker["execution_evidence"].(map[string]interface{}); ok {
		if completed, ok := ee["completed"].([]interface{}); ok && len(completed) > 0 {
			return false
		}
	}
	stepsRaw, ok := tracker["steps"].([]interface{})
	if !ok {
		return false
	}
	for _, item := range stepsRaw {
		row, ok := item.(map[string]interface{})
		if !ok {
			return false
		}
		disp, _ := row["disposition"].(string)
		if strings.TrimSpace(disp) != "" && disp != "pending" {
			return false
		}
		if hasAnyEvidence(row) {
			return false
		}
	}
	return true
}

func hasAnyEvidence(row map[string]interface{}) bool {
	if refs, ok := row["evidence_refs"].([]interface{}); ok && len(refs) > 0 {
		return true
	}
	for _, key := range []string{"policy", "rationale", "owner", "expiry", "approval", "residual_risk"} {
		if v, ok := row[key].(string); ok && strings.TrimSpace(v) != "" {
			return true
		}
	}
	return false
}
