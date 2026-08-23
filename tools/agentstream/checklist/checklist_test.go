package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"stdd/agentstream"

	"gopkg.in/yaml.v3"
)

// [IMPL-GOAGENT-CHECKLIST] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
// How: MessagesFromYAML renders main steps with preconditions; bounds slice by slug.
const testChecklistYAML = `
name: test_checklist
version: "0"
process_token: '[PROC-TEST]'
steps:
  - slug: alpha
    title: First
    goals: Reach alpha.
    preconditions:
      - Alpha precondition one.
    tasks: [a]
  - slug: beta
    title: Second
    tasks: [b]
  - slug: gamma
    title: Third
    tasks: [c]
sub_procedures:
  - slug: sub-slug-x
    title: Sub
    goals: Do sub work.
    preconditions:
      - Sub precondition one.
    tasks: [subtask]
`

func writeTestYAML(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	p := filepath.Join(dir, "checklist.yaml")
	if err := os.WriteFile(p, []byte(strings.TrimLeft(testChecklistYAML, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestMessagesFromYAML_fullSteps(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 3 {
		t.Fatalf("want 3 main step messages, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step alpha:") || !strings.Contains(msgs[2], "## Step gamma:") {
		t.Fatalf("unexpected content: %#v", msgs)
	}
	if !strings.Contains(msgs[0], "### Preconditions") || !strings.Contains(msgs[0], "- Alpha precondition one.") {
		t.Fatalf("main step should render preconditions: %s", msgs[0])
	}
}

func TestMessagesFromYAML_boundsBoth(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepFromID: "beta", StepToID: "beta"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 || !strings.Contains(msgs[0], "## Step beta:") {
		t.Fatalf("got %#v", msgs)
	}
}

func TestMessagesFromYAML_boundsBothBySlug(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepFromID: "beta", StepToID: "beta"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 || !strings.Contains(msgs[0], "## Step beta:") {
		t.Fatalf("got %#v", msgs)
	}
}

func TestMessagesFromYAML_lowerOnly(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepFromID: "beta"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 2 {
		t.Fatalf("want 2 messages, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step beta:") || !strings.Contains(msgs[1], "## Step gamma:") {
		t.Fatal()
	}
}

func TestMessagesFromYAML_upperOnly(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepToID: "beta"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 2 {
		t.Fatalf("want 2 messages, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step alpha:") || !strings.Contains(msgs[1], "## Step beta:") {
		t.Fatal()
	}
}

func TestMessagesFromYAML_withSubs(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{
		IncludeSubProcedures: true,
		StepFromID:           "gamma",
		StepToID:             "gamma",
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 2 {
		t.Fatalf("want 1 main + 1 sub, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step gamma:") || !strings.Contains(msgs[1], "## sub-slug-x:") {
		t.Fatal()
	}
	if !strings.Contains(msgs[1], "### Preconditions") || !strings.Contains(msgs[1], "- Sub precondition one.") {
		t.Fatalf("sub-procedure should render preconditions: %s", msgs[1])
	}
}

func TestMessagesFromYAML_flowAndProseUseSlugs(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "flow.yaml")
	y := `
name: flow_test
version: "1"
process_token: '[P]'
steps:
  - slug: gate-pseudocode-validation
    title: Gating step
    tasks:
      - Do not proceed to persist-implementation-records until ready.
    flow:
      next: persist-implementation-records
      branches:
        - condition: IF stuck THEN GOTO gate-pseudocode-validation
          action: retry
          target: persist-implementation-records
      calls:
        - sub-pseudocode-validation-pass
  - slug: persist-implementation-records
    title: Next step
    tasks: [x]
sub_procedures:
  - slug: sub-pseudocode-validation-pass
    title: Validate
    invoked_by:
      - gate-pseudocode-validation
    tasks:
      - RETURN to gate-pseudocode-validation then go to persist-implementation-records.
    flow:
      return_to: gate-pseudocode-validation
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	msgs, err := MessagesFromYAML(p, Options{IncludeSubProcedures: true})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 3 {
		t.Fatalf("want 3 messages, got %d", len(msgs))
	}
	body := msgs[0]
	if strings.Contains(body, "S06.5a") || strings.Contains(body, "S06.6") {
		t.Fatalf("main step should not contain legacy S* step ids in tasks/flow: %s", body)
	}
	if !strings.Contains(body, "- next: persist-implementation-records") {
		t.Fatalf("missing resolved next in flow: %s", body)
	}
	if !strings.Contains(body, "(target: persist-implementation-records)") {
		t.Fatalf("missing resolved branch target: %s", body)
	}
	if !strings.Contains(body, "- CALL sub-pseudocode-validation-pass") {
		t.Fatalf("missing resolved CALL: %s", body)
	}
	if !strings.Contains(body, "gate-pseudocode-validation") || !strings.Contains(body, "Do not proceed to persist-implementation-records") {
		t.Fatalf("task prose not substituted: %s", body)
	}
	subBody := msgs[2]
	if strings.Contains(subBody, "S06.5a") || strings.Contains(subBody, "S06.6") {
		t.Fatalf("sub-procedure should not contain legacy S* ids: %s", subBody)
	}
	if !strings.Contains(subBody, "- return_to: gate-pseudocode-validation") {
		t.Fatalf("missing resolved return_to: %s", subBody)
	}
	if !strings.Contains(subBody, "### Invoked by") || !strings.Contains(subBody, "- gate-pseudocode-validation") {
		t.Fatalf("invoked_by should use slug: %s", subBody)
	}
}

func TestMessagesFromYAML_missingFromID(t *testing.T) {
	path := writeTestYAML(t)
	_, err := MessagesFromYAML(path, Options{StepFromID: "Nope"})
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("want not found error, got %v", err)
	}
}

func TestMessagesFromYAML_missingToID(t *testing.T) {
	path := writeTestYAML(t)
	_, err := MessagesFromYAML(path, Options{StepToID: "Nope"})
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("want not found error, got %v", err)
	}
}

func TestMessagesFromYAML_invertedRange(t *testing.T) {
	path := writeTestYAML(t)
	_, err := MessagesFromYAML(path, Options{StepFromID: "gamma", StepToID: "alpha"})
	if err == nil || !strings.Contains(err.Error(), "invalid") {
		t.Fatalf("want invalid range error, got %v", err)
	}
}

func TestLoadTurns_agentstreamNewSession(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "s.yaml")
	y := `
name: s
version: "0"
process_token: '[P]'
steps:
  - slug: first
    title: A
    tasks: [a]
  - slug: second
    agentstream_new_session: true
    title: B
    tasks: [b]
sub_procedures:
  - slug: with-new
    agentstream_new_session: true
    title: SubN
    tasks: [s]
  - slug: with-chain
    title: SubC
    tasks: [t]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	turns, err := LoadTurns(p, Options{IncludeSubProcedures: true})
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 4 {
		t.Fatalf("want 4 turns, got %d", len(turns))
	}
	if !turns[0].ChainFromPrevious {
		t.Fatalf("first main step should chain by default")
	}
	if turns[1].ChainFromPrevious {
		t.Fatalf("second main step with agentstream_new_session should not chain")
	}
	if turns[2].ChainFromPrevious {
		t.Fatalf("sub with agentstream_new_session should not chain")
	}
	if !turns[3].ChainFromPrevious {
		t.Fatalf("sub without flag should chain from previous")
	}
}

func TestLoadTurns_agentstreamNewSession_quotedString(t *testing.T) {
	// Canonical checklist YAML may quote bools after double-quoted scalar lint.
	dir := t.TempDir()
	p := filepath.Join(dir, "quoted.yaml")
	y := `
name: q
version: "0"
steps:
  - slug: first
    title: A
    tasks: [a]
  - slug: second
    agentstream_new_session: "true"
    title: B
    tasks: [b]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	turns, err := LoadTurns(p, Options{})
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 2 {
		t.Fatalf("want 2 turns, got %d", len(turns))
	}
	if turns[1].ChainFromPrevious {
		t.Fatalf("quoted \"true\" must break chain")
	}
}

// [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
// How: ApplyLoopBackClearance clears on-disk completion markers for configured loop-back slugs.
func TestApplyLoopBackClearance(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "checklist.yaml")
	y := `
name: s
version: "0"
loop_back_clearance:
  flag-contradictory-specs:
    clear_slugs:
      - flag-contradictory-specs
      - unit-test-green
steps:
  # slug flag-contradictory-specs time 1711111111
  - slug: flag-contradictory-specs
    title: Flag
    tasks: [f]
  # slug unit-test-green time 1711111112
  - slug: unit-test-green
    title: Green
    tasks: [g]
  # slug unit-refactor time 1711111113
  - slug: unit-refactor
    title: Refactor
    tasks: [r]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	cleared, err := ApplyLoopBackClearance(p, "flag-contradictory-specs")
	if err != nil {
		t.Fatal(err)
	}
	if strings.Join(cleared, ",") != "flag-contradictory-specs,unit-test-green" {
		t.Fatalf("unexpected cleared slugs: %v", cleared)
	}
	got, err := os.ReadFile(p)
	if err != nil {
		t.Fatal(err)
	}
	body := string(got)
	if strings.Contains(body, "flag-contradictory-specs time 1711111111") ||
		strings.Contains(body, "unit-test-green time 1711111112") {
		t.Fatalf("loop-back markers were not cleared:\n%s", body)
	}
	if !strings.Contains(body, "unit-refactor time 1711111113") {
		t.Fatalf("unrelated marker should remain:\n%s", body)
	}
}

func TestMessagesFromYAML_duplicateSlug(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "bad.yaml")
	y := `
name: bad
version: "0"
steps:
  - slug: dup
    title: x
    tasks: [a]
  - slug: dup
    title: y
    tasks: [b]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := MessagesFromYAML(p, Options{})
	if err == nil || !strings.Contains(err.Error(), "duplicate slug") {
		t.Fatalf("want duplicate slug error, got %v", err)
	}
}

func loadCanonicalSubProcedures(t *testing.T) []struct {
	Slug      string   `yaml:"slug"`
	InvokedBy []string `yaml:"invoked_by"`
	Tasks     []string `yaml:"tasks"`
} {
	t.Helper()
	canonical := findCanonicalChecklist(t)
	raw, err := os.ReadFile(canonical)
	if err != nil {
		t.Fatal(err)
	}
	var doc struct {
		SubProcedures []struct {
			Slug      string   `yaml:"slug"`
			InvokedBy []string `yaml:"invoked_by"`
			Tasks     []string `yaml:"tasks"`
		} `yaml:"sub_procedures"`
	}
	if err := yaml.Unmarshal(raw, &doc); err != nil {
		t.Fatal(err)
	}
	return doc.SubProcedures
}

func TestCanonicalChecklist_subAdversarialInquiryPassRegistered(t *testing.T) {
	// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
	// How: Part C4.1 — sub-adversarial-inquiry-pass must exist with invoked_by and tasks before close-out.
	var found bool
	for _, sub := range loadCanonicalSubProcedures(t) {
		if sub.Slug != "sub-adversarial-inquiry-pass" {
			continue
		}
		found = true
		if len(sub.InvokedBy) == 0 {
			t.Fatal("sub-adversarial-inquiry-pass must list invoked_by callers")
		}
		if len(sub.Tasks) == 0 {
			t.Fatal("sub-adversarial-inquiry-pass must list tasks")
		}
	}
	if !found {
		t.Fatal("canonical checklist missing sub_procedures slug sub-adversarial-inquiry-pass")
	}
}

func TestCanonicalChecklist_adversarialInquiryStepTaskCoverage(t *testing.T) {
	// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
	// How: Part B0/B/D slug-coverage — each step's rendered turn must contain the adversarial marker phrase.
	canonical := findCanonicalChecklist(t)
	cases := []struct {
		slug    string
		markers []string
	}{
		// Part B0
		{slug: "translate-sponsor-intent", markers: []string{"anti-example"}},
		{slug: "impact-discovery", markers: []string{"obligation inventory"}},
		{slug: "risk-assessment", markers: []string{"adversarial depth tier"}},
		{slug: "test-strategy", markers: []string{"independent oracle", "argv-only"}},
		{slug: "composition-integration", markers: []string{"binding-local adversarial case", "controlled_composition_fault"}},
		{slug: "verification-gate", markers: []string{"fidelity matrix", "command provenance", "validatestricteligibility"}},
		// Part B
		{slug: "session-bootstrap", markers: []string{"fidelity-research.md"}},
		{slug: "change-definition", markers: []string{"falsification"}},
		{slug: "author-requirement", markers: []string{"counterexample"}},
		{slug: "author-architecture", markers: []string{"invalid-state"}},
		{slug: "catalog-pseudocode-contracts", markers: []string{"failure modes", "termination"}},
		{slug: "flag-insufficient-specs", markers: []string{"finding ledger"}},
		{slug: "flag-contradictory-specs", markers: []string{"contradiction", "finding ledger"}},
		{slug: "gate-pseudocode-validation", markers: []string{"sub-adversarial-inquiry-pass"}},
		{slug: "unit-test-red", markers: []string{"expected failure reason"}},
		{slug: "unit-test-green", markers: []string{"bidirectional"}},
		{slug: "three-way-alignment-unit", markers: []string{"bidirectional"}},
		{slug: "traceable-commit", markers: []string{"evidence provenance", "finding count"}},
		{slug: "persist-citdp-record", markers: []string{"calibrate_pilot"}},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.slug, func(t *testing.T) {
			turns, err := LoadTurns(canonical, Options{
				StepFromID: tc.slug,
				StepToID:   tc.slug,
			})
			if err != nil {
				t.Fatal(err)
			}
			if len(turns) != 1 {
				t.Fatalf("want 1 turn for %q, got %d", tc.slug, len(turns))
			}
			body := strings.ToLower(strings.Join(turns[0].Parts, "\n"))
			for _, marker := range tc.markers {
				if !strings.Contains(body, strings.ToLower(marker)) {
					t.Fatalf("step %q missing marker %q in:\n%s", tc.slug, marker, strings.Join(turns[0].Parts, "\n"))
				}
			}
		})
	}
}

func TestCanonicalChecklist_adversarialInquiryUsesRealSlugsAndBoundedArtifacts(t *testing.T) {
	// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
	// How: integrate inquiry into existing checklist slugs with bounded working artifacts and human-approved scoped strict status.
	canonical := findCanonicalChecklist(t)
	turns, err := LoadTurns(canonical, Options{})
	if err != nil {
		t.Fatal(err)
	}
	required := []string{
		"translate-sponsor-intent",
		"change-definition",
		"impact-discovery",
		"author-requirement",
		"author-architecture",
		"resolve-pseudocode",
		"risk-assessment",
		"test-strategy",
		"unit-test-red",
		"unit-test-green",
		"composition-integration",
		"verification-gate",
		"sync-tied-stack",
		"persist-citdp-record",
		"traceable-commit",
	}
	positions := make(map[string]int)
	for i, turn := range turns {
		positions[turn.StepStub] = i
	}
	for _, slug := range required {
		if _, ok := positions[slug]; !ok {
			t.Fatalf("canonical checklist missing real slug %q", slug)
		}
	}
	if strings.Contains(strings.Join(MessagesFromTurns(turns), "\n"), "requirements-to-test-map") {
		t.Fatal("canonical checklist must not introduce a nonexistent requirements-to-test-map slug")
	}
	body := strings.Join(MessagesFromTurns(turns), "\n")
	for _, needle := range []string{
		"tied_adversarial_inquiry_run",
		"working/{REQ-TOKEN}/adversarial-inquiry",
		"strict-candidate",
	} {
		if !strings.Contains(body, needle) {
			t.Fatalf("canonical checklist missing adversarial inquiry contract %q", needle)
		}
	}
}

func TestCanonicalChecklist_gateContractIsMachineValidated(t *testing.T) {
	canonical := findCanonicalChecklist(t)
	if _, err := LoadTurns(canonical, Options{StepFromID: "impact-discovery", StepToID: "impact-discovery"}); err != nil {
		t.Fatalf("canonical gate contract should validate: %v", err)
	}
}

func TestMessagesFromYAML_rejectsIncompleteGateContract(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "invalid-gate.yaml")
	y := `
name: invalid_gate
gate_contract:
  phases: [pre_implementation]
  dispositions: [pending, completed, not_applicable, waived]
  required_artifacts: [obligation-report.json]
  depth_selection_before_inquiry: true
  loop_back_invalidates_downstream_evidence: true
  fail_closed: true
steps:
  - slug: only
    tasks: [test]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := LoadTurns(p, Options{}); err == nil || !strings.Contains(err.Error(), "gate_contract") {
		t.Fatalf("want gate contract validation error, got %v", err)
	}
}

func MessagesFromTurns(turns []agentstream.Turn) []string {
	out := make([]string, 0, len(turns))
	for _, turn := range turns {
		out = append(out, strings.Join(turn.Parts, "\n"))
	}
	return out
}
