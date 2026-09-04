/**
 * [REQ-VOCABULARY_VIEWER_STATE] [IMPL-VOCABULARY_VIEWER_STATE] state unit tests
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  applyHistoryTransition,
  decodeViewerFragment,
  encodeViewerFragment,
  filterTermsForState,
} from "./state.js";

describe("state REQ-VOCABULARY_VIEWER_STATE", () => {
  it("round-trips fragment encode and decode", () => {
    const state = {
      q: "widget",
      sel: "abc123",
      kind: "tied_token",
      dir: "src",
      fk: "production",
      lang: "typescript",
      prod: "production",
      minf: "2",
      view: "relationships",
    };
    const frag = encodeViewerFragment(state);
    const decoded = decodeViewerFragment(frag);
    assert.strictEqual(decoded.q, state.q);
    assert.strictEqual(decoded.sel, state.sel);
    assert.strictEqual(decoded.kind, state.kind);
    assert.strictEqual(decoded.view, state.view);
  });

  it("simulates history back and forward", () => {
    const s0 = decodeViewerFragment("");
    const s1 = { ...s0, q: "a" };
    const s2 = { ...s1, q: "ab" };
    const stack = [s0, s1, s2];
    const back = applyHistoryTransition(stack, 2, "back");
    assert.strictEqual(back.index, 1);
    assert.strictEqual(back.state.q, "a");
    const fwd = applyHistoryTransition(stack, back.index, "forward");
    assert.strictEqual(fwd.index, 2);
    assert.strictEqual(fwd.state.q, "ab");
  });

  it("filters terms by search and kind", () => {
    const terms = [
      {
        id: "1",
        kind: "tied_token",
        display: "REQ-FOO",
        frequency: 1,
        occurrences: [{ path: "src/a.ts", file_kind: "production" }],
      },
      {
        id: "2",
        kind: "source_identifier",
        display: "widgetHandler",
        frequency: 3,
        occurrences: [{ path: "src/b.ts", file_kind: "test" }],
      },
    ];
    const filtered = filterTermsForState(terms, { ...decodeViewerFragment(""), q: "widget", kind: "", sel: "", dir: "", fk: "", lang: "", prod: "", minf: "", view: "frequency" }, 2);
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].display, "widgetHandler");
  });
});
