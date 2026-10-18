/**
 * [IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  bindClientAgentDriver,
  buildScheduleExecutorFromBoundDriver,
  type BoundAgentDriverSession,
} from "./agentstream-seam.js";

const scheduleContext = {
  request_token: "REQ-TIED_BOUNDED_COMPOSITION",
  source_revision: "rev-1",
  provenance_carry_forward: ["inquiry:bc-preimpl-20261018"],
};

describe("bindClientAgentDriver [IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM]", () => {
  it("binds built-in dry_run profile without live factory", () => {
    const bound = bindClientAgentDriver(
      scheduleContext,
      { kind: "builtin", profile: "dry_run" },
      { dry_run: true },
    );
    assert.equal(bound.ok, true);
    if (!bound.ok) return;
    assert.equal(bound.session.driver_kind, "dry_run");
    assert.equal(bound.session.dry_run, true);
    assert.ok(bound.session.provenance_refs.some((ref) => ref.includes("dry_run")));
  });

  it("rejects unknown built-in profile", () => {
    const bound = bindClientAgentDriver(
      scheduleContext,
      { kind: "builtin", profile: "opencode" as "cursor" },
      { dry_run: true },
    );
    assert.equal(bound.ok, false);
    if (bound.ok) return;
    assert.equal(bound.error.code, "InvalidDriverContract");
  });

  it("requires OEE compatibility ref on client descriptor", () => {
    const bound = bindClientAgentDriver(
      scheduleContext,
      {
        kind: "client_descriptor",
        adapter_id: "client-opencode",
        oee_compatibility_ref: "",
      },
      { dry_run: true },
    );
    assert.equal(bound.ok, false);
    if (bound.ok) return;
    assert.equal(bound.error.code, "InvalidDriverContract");
  });

  it("rejects live external client driver without operator approval", () => {
    const bound = bindClientAgentDriver(
      scheduleContext,
      {
        kind: "client_descriptor",
        adapter_id: "client-opencode",
        oee_compatibility_ref: "oee:compat-ledger/client-opencode",
      },
      { dry_run: false },
    );
    assert.equal(bound.ok, false);
    if (bound.ok) return;
    assert.equal(bound.error.code, "LiveExternalNotApproved");
  });

  it("binds injected client driver when approved", async () => {
    const bound = bindClientAgentDriver(
      scheduleContext,
      {
        kind: "client_descriptor",
        adapter_id: "client-fixture",
        oee_compatibility_ref: "oee:compat-ledger/client-fixture",
        live_external_approved: true,
      },
      {
        dry_run: false,
        deps: {
          clientDriverFactory: (descriptor) => ({
            runTurn: async () => ({
              exit_code: 0,
              session_id: `session-${descriptor.adapter_id}`,
              provenance_ref: `client-driver:${descriptor.adapter_id}`,
            }),
          }),
        },
      },
    );
    assert.equal(bound.ok, true);
    if (!bound.ok) return;
    const turn = await bound.session.runTurn(["argv"], []);
    assert.equal(turn.session_id, "session-client-fixture");
  });

  it("buildScheduleExecutorFromBoundDriver stops on failed turn outcome", async () => {
    const session: BoundAgentDriverSession = {
      driver_kind: "client_injected",
      dry_run: false,
      session_id: "s1",
      provenance_refs: ["prov"],
      runTurn: async () => ({
        exit_code: 1,
        session_id: "s1",
        provenance_ref: "client-driver:fail",
      }),
    };
    const executor = buildScheduleExecutorFromBoundDriver(session);
    const result = await executor({
      parts: ["TASK_GROUP A"],
      chainFromPrevious: false,
      task_ids: ["TASK-A"],
    });
    assert.equal(result.outcome, "failed");
    assert.equal(result.provenance, "client-driver:fail");
  });
});
