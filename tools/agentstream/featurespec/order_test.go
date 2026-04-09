package featurespec

import (
	"testing"
)

// REQ: REQ-GOAGENT-FEATURESPEC, REQ-GOAGENT-CLI-CONFIG
func TestParseOrderFilter_single(t *testing.T) {
	f, err := ParseOrderFilter("2")
	if err != nil {
		t.Fatal(err)
	}
	if !f.Matches(2) || f.Matches(3) {
		t.Fatalf("expected match 2 only, got %+v", f)
	}
}

func TestParseOrderFilter_range(t *testing.T) {
	f, err := ParseOrderFilter("1.5 - 3")
	if err != nil {
		t.Fatal(err)
	}
	if !f.Matches(2) || !f.Matches(1.5) || f.Matches(4) {
		t.Fatalf("range match failed %+v", f)
	}
}

func TestParseOrderFilter_invalidRange(t *testing.T) {
	_, err := ParseOrderFilter("3-1")
	if err == nil {
		t.Fatal("expected error")
	}
}
