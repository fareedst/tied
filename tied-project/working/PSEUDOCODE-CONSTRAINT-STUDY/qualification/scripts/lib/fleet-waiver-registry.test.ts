/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — waiver registry expiry helper.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertNoBlockingWaivers,
  findExpiredWaivers,
  listActiveWaivers,
  type MigrationWaiverRegistry,
} from "./fleet-waiver-registry.ts";

const emptyRegistry: MigrationWaiverRegistry = {
  schema_version: 1,
  registry_id: "test",
  updated_at: "2026-01-01T00:00:00Z",
  waivers: [],
};

test("empty registry passes waiver check", () => {
  assert.deepEqual(findExpiredWaivers(emptyRegistry), []);
  assert.deepEqual(assertNoBlockingWaivers(emptyRegistry), { ok: true });
  assert.deepEqual(listActiveWaivers(emptyRegistry), []);
});

test("findExpiredWaivers flags past expires_at on active status", () => {
  const registry: MigrationWaiverRegistry = {
    ...emptyRegistry,
    waivers: [
      {
        schema_version: 1,
        waiver_id: "W-1",
        owner: "owner",
        reason: "test",
        issued_at: "2026-01-01T00:00:00Z",
        expires_at: "2026-01-02T00:00:00Z",
        scope: { kind: "client", client_id: "stdd" },
        status: "active",
      },
    ],
  };
  const asOf = new Date("2026-06-01T00:00:00Z");
  const expired = findExpiredWaivers(registry, asOf);
  assert.equal(expired.length, 1);
  assert.equal(expired[0].waiver_id, "W-1");
  assert.deepEqual(assertNoBlockingWaivers(registry, asOf), {
    ok: false,
    expired_waiver_ids: ["W-1"],
  });
});
