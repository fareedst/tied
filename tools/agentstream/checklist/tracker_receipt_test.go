package checklist

import (
	"strings"
	"testing"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: receipt parser table tests for disposition contracts.
func receiptJSON(body string) string {
	return "```json\n" + body + "\n```"
}

func TestParseTrackerCompletionReceipt_completed(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"completed","evidence_refs":["working/REQ-X/alpha.md"]}}`)
	got, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if err != nil || !ok {
		t.Fatalf("parse failed: ok=%v err=%v", ok, err)
	}
	if got.Disposition != "completed" || len(got.EvidenceRefs) != 1 {
		t.Fatalf("unexpected receipt: %#v", got)
	}
}

func TestParseTrackerCompletionReceipt_notApplicable(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"not_applicable","policy":"no-change","rationale":"already done"}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if err != nil || !ok {
		t.Fatalf("parse failed: ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_waived(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"waived","owner":"lead","expiry":"2026-12-31","approval":"sponsor","residual_risk":"low"}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if err != nil || !ok {
		t.Fatalf("parse failed: ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_missingReceipt(t *testing.T) {
	_, ok, err := ParseTrackerCompletionReceipt("no receipt here", "alpha")
	if ok || err == nil || !strings.Contains(err.Error(), "missing_receipt") {
		t.Fatalf("expected missing_receipt, ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_wrongSlug(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"beta","disposition":"completed","evidence_refs":["x"]}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if ok || err == nil || !strings.Contains(err.Error(), "wrong_slug") {
		t.Fatalf("expected wrong_slug, ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_skippedRejected(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"skipped"}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if ok || err == nil || !strings.Contains(err.Error(), "skipped_disposition_rejected") {
		t.Fatalf("expected skipped rejection, ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_unknownField(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"completed","evidence_refs":["x"],"extra":true}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if ok || err == nil || !strings.Contains(err.Error(), "unknown_field") {
		t.Fatalf("expected unknown_field, ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_unsupportedSchema(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":2,"slug":"alpha","disposition":"completed","evidence_refs":["x"]}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if ok || err == nil || !strings.Contains(err.Error(), "unsupported_schema") {
		t.Fatalf("expected unsupported_schema, ok=%v err=%v", ok, err)
	}
}

func TestParseTrackerCompletionReceipt_missingEvidence(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"completed"}}`)
	_, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if ok || err == nil || !strings.Contains(err.Error(), "missing_disposition_evidence") {
		t.Fatalf("expected missing evidence, ok=%v err=%v", ok, err)
	}
}

func TestReceiptHash_idempotentReplay(t *testing.T) {
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-X/alpha.md"},
	}
	h1 := ReceiptHash(receipt)
	h2 := ReceiptHash(receipt)
	if h1 != h2 {
		t.Fatalf("hash not stable: %s vs %s", h1, h2)
	}
}

func TestParseTrackerCompletionReceipt_latestBlockWins(t *testing.T) {
	transcript := receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"completed","evidence_refs":["first"]}}`) +
		"\n" + receiptJSON(`{"agentstream_tracker":{"schema_version":1,"slug":"alpha","disposition":"completed","evidence_refs":["second"]}}`)
	got, ok, err := ParseTrackerCompletionReceipt(transcript, "alpha")
	if err != nil || !ok {
		t.Fatal(err)
	}
	if got.EvidenceRefs[0] != "second" {
		t.Fatalf("expected latest block, got %#v", got.EvidenceRefs)
	}
}
