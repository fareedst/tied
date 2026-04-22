package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// REQ: REQ-GOAGENT-YAML-STEP-RENDER
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
