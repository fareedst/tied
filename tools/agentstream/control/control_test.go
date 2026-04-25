package control

import "testing"

// REQ-GOAGENT-CHECKLIST-CONTROL validates strict fenced control parsing.
func TestParseLatestFencedControl(t *testing.T) {
	text := "ordinary prose mentions GOTO flag-contradictory-specs\n" +
		"```json\n{\"not_agentstream_control\":true}\n```\n" +
		"```json\n{\"agentstream_control\":{\"schema_version\":1,\"action\":\"goto\",\"target\":\"flag-contradictory-specs\",\"reason\":\"existing tests failed\",\"evidence\":[\"TestOld\"]}}\n```\n"
	got, ok, err := Parse(text)
	if err != nil {
		t.Fatal(err)
	}
	if !ok {
		t.Fatal("want control decision")
	}
	if got.Action != ActionGoto || got.Target != "flag-contradictory-specs" || len(got.Evidence) != 1 {
		t.Fatalf("unexpected decision: %#v", got)
	}
}

// REQ-GOAGENT-CHECKLIST-CONTROL rejects natural-language clues without control JSON.
func TestParseIgnoresProseClues(t *testing.T) {
	got, ok, err := Parse("Please GOTO flag-contradictory-specs, but this is just prose.")
	if err != nil {
		t.Fatal(err)
	}
	if ok || got.Action != "" {
		t.Fatalf("prose should not produce control: ok=%v got=%#v", ok, got)
	}
}

// REQ-GOAGENT-CHECKLIST-CONTROL treats malformed control JSON as an error.
func TestParseMalformedControlJSON(t *testing.T) {
	_, ok, err := Parse("```json\n{\"agentstream_control\": \n```\n")
	if err == nil {
		t.Fatal("want malformed control error")
	}
	if ok {
		t.Fatal("malformed control should not be ok")
	}
}

// REQ-GOAGENT-CHECKLIST-CONTROL validates known targets before routing.
func TestValidateTarget(t *testing.T) {
	known := map[string]bool{"flag-contradictory-specs": true}
	if err := Validate(Decision{SchemaVersion: 1, Action: ActionGoto, Target: "flag-contradictory-specs"}, known); err != nil {
		t.Fatalf("valid target: %v", err)
	}
	if err := Validate(Decision{SchemaVersion: 1, Action: ActionGoto, Target: "missing"}, known); err == nil {
		t.Fatal("missing target should fail")
	}
	if err := Validate(Decision{SchemaVersion: 2, Action: ActionGoto, Target: "flag-contradictory-specs"}, known); err == nil {
		t.Fatal("wrong schema should fail")
	}
}
