// Shared adherence ledger row builders for tests and controlled-client pilots.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
package checklist

import "strings"

func minimalTracker(requestToken string) map[string]interface{} {
	return map[string]interface{}{
		"request_token":  requestToken,
		"schema_version": TrackerSchemaVersion,
		"steps":          []interface{}{},
	}
}

func instructionRenderedRow(turn int, slug, nonce, hash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "instruction_rendered",
		"correlation": map[string]interface{}{
			"request_token":     "REQ-TEST",
			"run_id":            "run-1",
			"turn_index":        turn,
			"step_slug":         slug,
			"instruction_hash":  hash,
			"instruction_nonce": nonce,
		},
		"source": map[string]interface{}{"kind": "agentstream"},
	}
}

func agentAcknowledgedRow(turn int, slug, nonce, hash, receiptHash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "agent_acknowledged",
		"correlation": map[string]interface{}{
			"request_token":     "REQ-TEST",
			"run_id":            "run-1",
			"turn_index":        turn,
			"step_slug":         slug,
			"instruction_hash":  hash,
			"instruction_nonce": nonce,
			"receipt_hash":      receiptHash,
		},
		"source": map[string]interface{}{"kind": "agentstream"},
	}
}

func actionAttemptedRow(turn int, slug, nonce, hash, receiptHash string, refs []string) map[string]interface{} {
	evidenceRefs := make([]interface{}, len(refs))
	for i, ref := range refs {
		evidenceRefs[i] = ref
	}
	corr := map[string]interface{}{
		"request_token":    "REQ-TEST",
		"run_id":           "run-1",
		"turn_index":       turn,
		"step_slug":        slug,
		"instruction_hash": hash,
	}
	if strings.TrimSpace(nonce) != "" {
		corr["instruction_nonce"] = nonce
	}
	if strings.TrimSpace(receiptHash) != "" {
		corr["receipt_hash"] = receiptHash
	}
	return map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "action_attempted",
		"correlation":    corr,
		"evidence_refs":  evidenceRefs,
		"hook_log_ref": map[string]interface{}{
			"path": "/tmp/synthetic-hook.yaml",
			"line": 1,
		},
		"source": map[string]interface{}{"kind": "cursor_hook", "hook_event": "postToolUse"},
	}
}

func outcomeVerifiedRow(turn int, slug, receiptHash, artifactRef, artifactHash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "outcome_verified",
		"correlation": map[string]interface{}{
			"request_token": "REQ-TEST",
			"run_id":        "run-1",
			"turn_index":    turn,
			"step_slug":     slug,
			"receipt_hash":  receiptHash,
		},
		"artifact_ref":  artifactRef,
		"artifact_hash": artifactHash,
		"ref_kind":      "file_path",
		"source":        map[string]interface{}{"kind": "agentstream"},
	}
}

func gateDecidedRow(requestToken, phase, artifactRef, artifactHash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "gate_decided",
		"correlation": map[string]interface{}{
			"request_token": requestToken,
			"phase":         phase,
		},
		"artifact_ref":  artifactRef,
		"artifact_hash": artifactHash,
		"source":        map[string]interface{}{"kind": "mcp_gate"},
	}
}

func statusMutatedRow(requestToken, gateRef, gateHash string) map[string]interface{} {
	return map[string]interface{}{
		"schema_version": adherenceEventSchemaVersion,
		"event_class":    "status_mutated",
		"correlation": map[string]interface{}{
			"request_token": requestToken,
		},
		"status_mutations": []interface{}{
			map[string]interface{}{
				"index":           "requirements",
				"token":           requestToken,
				"previous_status": "Planned",
				"next_status":     "Implemented",
			},
		},
		"gate_receipt_ref":  gateRef,
		"gate_receipt_hash": gateHash,
		"source":            map[string]interface{}{"kind": "tied_verify"},
	}
}
