package checklist

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: A29 PreviewTrackerMigration slug diff without Tracker mutation.
func fileSHA256(t *testing.T, path string) string {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

func writeTrackerWithExtraSlug(t *testing.T, def string, extraSlug, disposition string) string {
	t.Helper()
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	if err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{RequestToken: "REQ-PREVIEW"}); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	steps, _ := doc["steps"].([]interface{})
	steps = append(steps, map[string]interface{}{
		"slug":        extraSlug,
		"kind":        "main",
		"disposition": disposition,
	})
	doc["steps"] = steps
	if err := atomicWriteYAML(trackerPath, doc); err != nil {
		t.Fatal(err)
	}
	return trackerPath
}

func TestPreviewTrackerMigration_reportsSlugDiff(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := writeTrackerWithExtraSlug(t, def, "orphan-step", "completed")
	report, err := PreviewTrackerMigration(def, trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	if report.SchemaVersion != "tracker-migration-preview.v1" {
		t.Fatalf("schema_version=%q", report.SchemaVersion)
	}
	if !report.ReadOnly || report.WouldMaterializeFresh {
		t.Fatalf("read_only=%v would_materialize_fresh=%v", report.ReadOnly, report.WouldMaterializeFresh)
	}
	if len(report.DefinitionSlugs) == 0 || len(report.TrackerSlugs) == 0 {
		t.Fatalf("empty slug inventory: def=%v track=%v", report.DefinitionSlugs, report.TrackerSlugs)
	}
	if !containsString(report.ExtraInTracker, "orphan-step") {
		t.Fatalf("extra_in_tracker=%v want orphan-step", report.ExtraInTracker)
	}
	if len(report.StaleDispositions) != 1 {
		t.Fatalf("stale_dispositions=%v want 1 entry", report.StaleDispositions)
	}
	stale := report.StaleDispositions[0]
	if stale.Slug != "orphan-step" || stale.Disposition != "completed" || stale.Reason != "step_removed_from_definition" {
		t.Fatalf("stale disposition: %+v", stale)
	}
}

func TestPreviewTrackerMigration_missingInTracker(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	if err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{RequestToken: "REQ-PREVIEW"}); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	steps, _ := doc["steps"].([]interface{})
	filtered := make([]interface{}, 0, len(steps)-1)
	for _, item := range steps {
		row, _ := item.(map[string]interface{})
		if row["slug"] == "beta" {
			continue
		}
		filtered = append(filtered, item)
	}
	doc["steps"] = filtered
	if err := atomicWriteYAML(trackerPath, doc); err != nil {
		t.Fatal(err)
	}
	report, err := PreviewTrackerMigration(def, trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	if !containsString(report.MissingInTracker, "beta") {
		t.Fatalf("missing_in_tracker=%v want beta", report.MissingInTracker)
	}
}

func TestPreviewTrackerMigration_trackerFileHashUnchanged(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := writeTrackerWithExtraSlug(t, def, "legacy-step", "completed")
	before := fileSHA256(t, trackerPath)
	if _, err := PreviewTrackerMigration(def, trackerPath); err != nil {
		t.Fatal(err)
	}
	after := fileSHA256(t, trackerPath)
	if before != after {
		t.Fatalf("tracker file mutated: before=%s after=%s", before, after)
	}
}

func TestPreviewTrackerMigration_refusesDefinitionPath(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	_, err := PreviewTrackerMigration(def, def)
	if err == nil || !strings.Contains(err.Error(), "must not equal") {
		t.Fatalf("expected path refusal, got %v", err)
	}
}

func containsString(list []string, want string) bool {
	for _, s := range list {
		if s == want {
			return true
		}
	}
	return false
}
