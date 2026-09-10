// Typed and legacy evidence_refs entries for Tracker completion receipts.
// [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
package checklist

import (
	"encoding/json"
	"fmt"
	"strings"
)

// EvidenceRef is one evidence_refs[] entry (legacy string or typed map).
type EvidenceRef struct {
	raw json.RawMessage
}

// EvidenceRefFromString builds a legacy string evidence ref.
func EvidenceRefFromString(value string) EvidenceRef {
	raw, _ := json.Marshal(value)
	return EvidenceRef{raw: raw}
}

func (ref EvidenceRef) MarshalJSON() ([]byte, error) {
	if len(ref.raw) == 0 {
		return []byte("null"), nil
	}
	return ref.raw, nil
}

func (ref *EvidenceRef) UnmarshalJSON(data []byte) error {
	ref.raw = append([]byte(nil), data...)
	return nil
}

func (ref EvidenceRef) StringValue() (string, bool) {
	var value string
	if err := json.Unmarshal(ref.raw, &value); err != nil {
		return "", false
	}
	return strings.TrimSpace(value), value != ""
}

func (ref EvidenceRef) MapValue() (map[string]interface{}, bool) {
	var value map[string]interface{}
	if err := json.Unmarshal(ref.raw, &value); err != nil {
		return nil, false
	}
	return value, true
}

func (ref EvidenceRef) ToInterface() interface{} {
	var value interface{}
	if err := json.Unmarshal(ref.raw, &value); err != nil {
		return nil
	}
	return value
}

func (ref EvidenceRef) CanonicalKey() string {
	if text, ok := ref.StringValue(); ok {
		return "s:" + text
	}
	if doc, ok := ref.MapValue(); ok {
		body, _ := json.Marshal(doc)
		return "m:" + string(body)
	}
	return "?"
}

func nonEmptyEvidenceRefs(refs []EvidenceRef) bool {
	for _, ref := range refs {
		if text, ok := ref.StringValue(); ok && text != "" {
			return true
		}
		if doc, ok := ref.MapValue(); ok && len(doc) > 0 {
			return true
		}
	}
	return false
}

func evidenceRefsToInterface(refs []EvidenceRef) []interface{} {
	out := make([]interface{}, 0, len(refs))
	for _, ref := range refs {
		if v := ref.ToInterface(); v != nil {
			out = append(out, v)
		}
	}
	return out
}

func evidenceRefsFromTrackerStep(step map[string]interface{}) []EvidenceRef {
	raw, ok := step["evidence_refs"].([]interface{})
	if !ok {
		return nil
	}
	var out []EvidenceRef
	for _, item := range raw {
		switch v := item.(type) {
		case string:
			if strings.TrimSpace(v) != "" {
				out = append(out, EvidenceRefFromString(v))
			}
		case map[string]interface{}:
			body, err := json.Marshal(v)
			if err != nil {
				continue
			}
			out = append(out, EvidenceRef{raw: body})
		}
	}
	return out
}

func parseEvidenceRefKind(doc map[string]interface{}) string {
	kind, _ := doc["kind"].(string)
	return strings.TrimSpace(kind)
}

func parseEvidenceRefPath(doc map[string]interface{}) string {
	path, _ := doc["path"].(string)
	return strings.TrimSpace(path)
}

func evidenceRefResolutionInput(ref EvidenceRef) (string, map[string]interface{}, error) {
	if text, ok := ref.StringValue(); ok {
		return text, nil, nil
	}
	if doc, ok := ref.MapValue(); ok {
		kind := parseEvidenceRefKind(doc)
		if kind == "command_evidence" || doc["claimed_success"] != nil {
			body, err := json.Marshal(doc)
			if err != nil {
				return "", nil, err
			}
			return string(body), doc, nil
		}
		path := parseEvidenceRefPath(doc)
		if path == "" {
			return "", nil, fmt.Errorf("unresolved_evidence_ref: typed ref missing path")
		}
		return path, doc, nil
	}
	return "", nil, fmt.Errorf("unresolved_evidence_ref: malformed ref")
}
