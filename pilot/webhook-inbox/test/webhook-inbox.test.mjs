import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { createWebhookInboxServer, processDueEvents } from "../src/server.mjs";

function sign(secret, timestamp, body) {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

function request(port, {
  body,
  timestamp,
  signature,
  idempotencyKey,
  path: requestPath = "/webhooks/inbox",
  method = "POST",
  omitHeaders = [],
}) {
  return new Promise((resolve, reject) => {
    const headers = {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(body),
      "x-webhook-timestamp": String(timestamp),
      "x-webhook-signature": signature,
      "x-idempotency-key": idempotencyKey,
    };
    for (const header of omitHeaders) delete headers[header];
    const request = http.request(
      {
        host: "127.0.0.1",
        port,
        method,
        path: requestPath,
        headers,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({ statusCode: response.statusCode, body: JSON.parse(Buffer.concat(chunks).toString("utf8")) }),
        );
      },
    );
    request.on("error", reject);
    request.end(body);
  });
}

describe("authenticated webhook inbox pilot [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("authenticates, persists, and deduplicates webhook retries", async () => {
    // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Exercise risk-triggered quality profiles on an authenticated SQLite webhook inbox.
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-inbox-"));
    const secret = "pilot-secret";
    const { server, store } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret,
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    const body = JSON.stringify({ id: "evt-1", kind: "invoice.created" });
    const timestamp = Math.floor(Date.now() / 1000);
    const headers = {
      body,
      timestamp,
      signature: sign(secret, timestamp, body),
      idempotencyKey: "idem-1",
    };

    const accepted = await request(port, headers);
    const duplicate = await request(port, headers);
    const unauthorized = await request(port, { ...headers, signature: "sha256=invalid" });
    const malformedBody = "{";
    const malformed = await request(port, {
      body: malformedBody,
      timestamp,
      signature: sign(secret, timestamp, malformedBody),
      idempotencyKey: "idem-malformed",
    });
    const replayTimestamp = timestamp - 10_000;
    const replay = await request(port, {
      body,
      timestamp: replayTimestamp,
      signature: sign(secret, replayTimestamp, body),
      idempotencyKey: "idem-replay",
    });

    assert.equal(accepted.statusCode, 202);
    assert.equal(duplicate.statusCode, 200);
    assert.equal(unauthorized.statusCode, 401);
    assert.equal(malformed.statusCode, 400);
    assert.equal(replay.statusCode, 401);
    assert.deepEqual(store.getByKey("idem-1"), {
      id: 1,
      event_id: "evt-1",
      idempotency_key: "idem-1",
      status: "pending",
      attempts: 0,
    });
    await new Promise((resolve) => server.close(resolve));
  });

  it("retries failed work and eventually marks it dead", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-retry-"));
    const { store } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret: "secret",
    });
    store.insertEvent({ eventId: "evt-2", idempotencyKey: "idem-2", payload: { id: "evt-2" }, now: 1_000 });

    const first = await processDueEvents(store, async () => {
      throw new Error("downstream unavailable");
    }, { now: 1_000, baseRetryDelayMs: 1, maxAttempts: 2 });
    const second = await processDueEvents(store, async () => {
      throw new Error("downstream unavailable");
    }, { now: 1_001, baseRetryDelayMs: 1, maxAttempts: 2 });
    const third = await processDueEvents(store, async () => undefined, { now: 1_003, baseRetryDelayMs: 1, maxAttempts: 2 });

    assert.deepEqual(first, [{ id: 1, status: "retry" }]);
    assert.deepEqual(second, [{ id: 1, status: "dead" }]);
    assert.deepEqual(third, []);
  });

  it("processes a claimed payload and enforces the worker batch limit", async () => {
    // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Exercise successful handler(payload) processing with a bounded batch.
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-success-"));
    const { store } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret: "secret",
    });
    store.insertEvent({ eventId: "evt-3", idempotencyKey: "idem-3", payload: { id: "evt-3" }, now: 1_000 });
    store.insertEvent({ eventId: "evt-4", idempotencyKey: "idem-4", payload: { id: "evt-4" }, now: 1_000 });

    const outcomes = await processDueEvents(store, async (payload) => {
      assert.match(payload.id, /^evt-/);
    }, { now: 1_000, batchSize: 1 });

    assert.deepEqual(outcomes, [{ id: 1, status: "processed" }]);
    assert.equal(store.getByKey("idem-3")?.status, "processed");
    assert.equal(store.getByKey("idem-4")?.status, "pending");
  });

  it("returns a bounded error for oversized request bodies", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-size-"));
    const secret = "pilot-secret";
    const { server } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret,
      maxBodyBytes: 10,
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    const body = JSON.stringify({ value: "too-large" });
    const timestamp = Math.floor(Date.now() / 1000);

    const result = await request(port, {
      body,
      timestamp,
      signature: sign(secret, timestamp, body),
      idempotencyKey: "idem-size",
    });

    assert.equal(result.statusCode, 413);
    assert.equal(result.body.error, "body_too_large");
    await new Promise((resolve) => server.close(resolve));
  });

  it("returns persistence failure without exposing storage details", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-persistence-"));
    const secret = "pilot-secret";
    const { server, store } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret,
    });
    store.insertEvent = () => {
      throw new Error("database unavailable: secret details");
    };
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    const body = JSON.stringify({ id: "evt-failure" });
    const timestamp = Math.floor(Date.now() / 1000);

    const result = await request(port, {
      body,
      timestamp,
      signature: sign(secret, timestamp, body),
      idempotencyKey: "idem-persistence",
    });

    assert.equal(result.statusCode, 503);
    assert.deepEqual(result.body, { error: "persistence_failed" });
    await new Promise((resolve) => server.close(resolve));
  });

  it("does not let a second worker process an already claimed event", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-claim-"));
    const { store } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret: "secret",
    });
    store.insertEvent({ eventId: "evt-claim", idempotencyKey: "idem-claim", payload: { id: "evt-claim" }, now: 1_000 });

    const candidate = store.listDue({ now: 1_000, limit: 1 })[0];
    const first = store.claim(candidate.id);
    const second = store.claim(candidate.id);

    assert.equal(first?.status, "processing");
    assert.equal(second, null);
  });

  it("rejects unsupported routes, non-object payloads, and missing authentication headers", async () => {
    // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Verify bounded HTTP routing, payload shape, and authentication-header failures at the composition boundary.
    const directory = await mkdtemp(path.join(os.tmpdir(), "tied-webhook-boundaries-"));
    const secret = "pilot-secret";
    const { server } = createWebhookInboxServer({
      dbPath: path.join(directory, "inbox.sqlite"),
      secret,
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    const timestamp = Math.floor(Date.now() / 1000);
    const arrayBody = JSON.stringify(["not", "an", "object"]);

    const notFound = await request(port, {
      body: "{}",
      timestamp,
      signature: sign(secret, timestamp, "{}"),
      idempotencyKey: "idem-not-found",
      path: "/other",
    });
    const payloadObjectRequired = await request(port, {
      body: arrayBody,
      timestamp,
      signature: sign(secret, timestamp, arrayBody),
      idempotencyKey: "idem-array",
    });
    const missingSignature = await request(port, {
      body: "{}",
      timestamp,
      signature: sign(secret, timestamp, "{}"),
      idempotencyKey: "idem-missing-signature",
      omitHeaders: ["x-webhook-signature"],
    });

    assert.deepEqual(notFound.body, { error: "not_found" });
    assert.equal(notFound.statusCode, 404);
    assert.deepEqual(payloadObjectRequired.body, { error: "payload_object_required" });
    assert.equal(payloadObjectRequired.statusCode, 400);
    assert.deepEqual(missingSignature.body, { error: "unauthorized" });
    assert.equal(missingSignature.statusCode, 401);
    await new Promise((resolve) => server.close(resolve));
  });
});
