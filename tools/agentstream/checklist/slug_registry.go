// Canonical checklist slug registry for tracker writer validation.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
package checklist

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"gopkg.in/yaml.v3"
)

var (
	canonicalSlugMu sync.RWMutex
	canonicalSlugs  map[string]struct{}
	canonicalRoot   string
)

type slugDoc struct {
	Steps         []struct {
		Slug string `yaml:"slug"`
	} `yaml:"steps"`
	SubProcedures []struct {
		Slug string `yaml:"slug"`
	} `yaml:"sub_procedures"`
}

func walkForChecklist(start string) string {
	dir := start
	if st, err := os.Stat(start); err == nil && !st.IsDir() {
		dir = filepath.Dir(start)
	}
	for {
		candidate := filepath.Join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml")
		if st, err := os.Stat(candidate); err == nil && !st.IsDir() {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return ""
		}
		dir = parent
	}
}

func findRepoRootFromPath(start string) string {
	if root := walkForChecklist(start); root != "" {
		return root
	}
	if cwd, err := os.Getwd(); err == nil {
		return walkForChecklist(cwd)
	}
	return ""
}

func loadChecklistSlugsFromFile(checklistPath string) (map[string]struct{}, error) {
	raw, err := os.ReadFile(checklistPath)
	if err != nil {
		return nil, fmt.Errorf("checklist_read_failed: %w", err)
	}
	var doc slugDoc
	if err := yaml.Unmarshal(raw, &doc); err != nil {
		return nil, fmt.Errorf("checklist_parse_failed: %w", err)
	}
	out := make(map[string]struct{})
	for _, step := range doc.Steps {
		slug := strings.TrimSpace(step.Slug)
		if slug != "" {
			out[slug] = struct{}{}
		}
	}
	for _, sub := range doc.SubProcedures {
		slug := strings.TrimSpace(sub.Slug)
		if slug != "" {
			out[slug] = struct{}{}
		}
	}
	return out, nil
}

// LoadCanonicalChecklistSlugs reads step and sub_procedure slugs from the canonical checklist YAML.
func LoadCanonicalChecklistSlugs(repoRoot string) (map[string]struct{}, error) {
	if repoRoot == "" {
		return nil, fmt.Errorf("repo_root_missing")
	}
	checklistPath := filepath.Join(repoRoot, "tied", "docs", "agent-req-implementation-checklist.yaml")
	return loadChecklistSlugsFromFile(checklistPath)
}

func cachedCanonicalSlugs(repoRoot string) (map[string]struct{}, error) {
	canonicalSlugMu.RLock()
	if canonicalSlugs != nil && canonicalRoot == repoRoot {
		defer canonicalSlugMu.RUnlock()
		return canonicalSlugs, nil
	}
	canonicalSlugMu.RUnlock()

	canonicalSlugMu.Lock()
	defer canonicalSlugMu.Unlock()
	if canonicalSlugs != nil && canonicalRoot == repoRoot {
		return canonicalSlugs, nil
	}
	slugs, err := LoadCanonicalChecklistSlugs(repoRoot)
	if err != nil {
		return nil, err
	}
	canonicalSlugs = slugs
	canonicalRoot = repoRoot
	return canonicalSlugs, nil
}

func slugRegistryForTracker(trackerPath string) (map[string]struct{}, error) {
	if tracker, err := LoadTrackerYAML(trackerPath); err == nil {
		if src, ok := tracker["source_document"].(string); ok {
			src = strings.TrimSpace(src)
			if src != "" {
				if slugs, err := loadChecklistSlugsFromFile(src); err == nil && len(slugs) > 0 {
					return slugs, nil
				}
			}
		}
	}
	repoRoot := findRepoRootFromPath(trackerPath)
	if repoRoot == "" {
		return nil, fmt.Errorf("registry_unavailable")
	}
	return cachedCanonicalSlugs(repoRoot)
}

// ValidateCanonicalSlug rejects unknown checklist slugs (invalid_slug).
func ValidateCanonicalSlug(trackerPath, slug string) error {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return fmt.Errorf("invalid_slug:empty")
	}
	slugs, err := slugRegistryForTracker(trackerPath)
	if err != nil {
		return fmt.Errorf("invalid_slug:registry_unavailable")
	}
	if _, ok := slugs[slug]; !ok {
		return fmt.Errorf("invalid_slug:%s", slug)
	}
	return nil
}
