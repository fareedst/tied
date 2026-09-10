package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestValidateCanonicalSlug_rejectsAuthorImplementation(t *testing.T) {
	repo := findCanonicalChecklistRepo(t)
	trackerPath := filepath.Join(repo, "working", "REQ-TEST", "tracker.yaml")
	err := ValidateCanonicalSlug(trackerPath, "author-implementation")
	if err == nil || !strings.Contains(err.Error(), "invalid_slug:author-implementation") {
		t.Fatalf("expected invalid_slug for author-implementation, got %v", err)
	}
}

func TestValidateCanonicalSlug_acceptsGatePseudocodeValidation(t *testing.T) {
	repo := findCanonicalChecklistRepo(t)
	trackerPath := filepath.Join(repo, "working", "REQ-TEST", "tracker.yaml")
	if err := ValidateCanonicalSlug(trackerPath, "gate-pseudocode-validation"); err != nil {
		t.Fatalf("expected canonical slug gate-pseudocode-validation, got %v", err)
	}
}

func findCanonicalChecklistRepo(t *testing.T) string {
	t.Helper()
	dir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	for {
		p := filepath.Join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml")
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Skip("canonical checklist not found")
		}
		dir = parent
	}
}
