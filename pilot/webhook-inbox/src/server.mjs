/**
 * [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Authenticate bounded webhook requests before idempotent SQLite persistence.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer as createHttpServer } from "node:http";
import { fileURLToPath } from "node:url";
import { createInboxStore } from "./sqlite-store.mjs";

function signatureFor(secret, timestamp, body) {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

function constantTimeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createWebhookInboxServer({
  dbPath,
  secret,
  maxBodyBytes = 100_000,
  replayWindowSeconds = 300,
} = {}) {
  if (!dbPath || !secret) throw new Error("dbPath and secret are required");
  const store = createInboxStore(dbPath);
  store.init();

  // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Authenticate timestamped raw input before JSON parsing and idempotent persistence.
  const server = createHttpServer((request, response) => {
    if (request.method !== "POST" || request.url !== "/webhooks/inbox") {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "not_found" }));
      return;
    }

    const chunks = [];
    let bytes = 0;
    let rejected = false;
    request.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBodyBytes) {
        rejected = true;
        // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
        // How: Stop collecting oversized input and return a bounded client error before authentication or persistence.
        if (!response.headersSent) {
          response.writeHead(413, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "body_too_large" }));
        }
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (rejected) return;
      // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
      // How: Validate timestamp/signature before parsing or persisting external input.
      const rawBody = Buffer.concat(chunks).toString("utf8");
      const timestamp = request.headers["x-webhook-timestamp"];
      const signature = request.headers["x-webhook-signature"];
      const idempotencyKey = request.headers["x-idempotency-key"];
      const now = Math.floor(Date.now() / 1000);
      const timestampNumber = Number(timestamp);
      if (
        typeof timestamp !== "string" ||
        typeof signature !== "string" ||
        typeof idempotencyKey !== "string" ||
        !Number.isInteger(timestampNumber) ||
        Math.abs(now - timestampNumber) > replayWindowSeconds ||
        !constantTimeEqual(signature, signatureFor(secret, timestamp, rawBody))
      ) {
        response.writeHead(401, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }

      let payload;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "malformed_json" }));
        return;
      }
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "payload_object_required" }));
        return;
      }

      try {
        // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
        // How: Use a unique idempotency key so retries do not create duplicate inbox events.
        const inserted = store.insertEvent({
          eventId: typeof payload.id === "string" ? payload.id : idempotencyKey,
          idempotencyKey,
          payload,
        });
        response.writeHead(inserted ? 202 : 200, { "content-type": "application/json" });
        response.end(JSON.stringify({ status: inserted ? "accepted" : "duplicate" }));
      } catch {
        response.writeHead(503, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "persistence_failed" }));
      }
    });
    request.on("error", () => {
      if (!response.headersSent) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "request_failed" }));
      }
    });
  });

  return { server, store };
}

// [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
// How: Process only successfully claimed due events, invoke handler(payload), and transition the claimed row.
export async function processDueEvents(store, handler, {
  now = Date.now(),
  batchSize = 10,
  maxAttempts = 3,
  baseRetryDelayMs = 100,
} = {}) {
  const outcomes = [];
  for (const candidate of store.listDue({ now, limit: batchSize })) {
    // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Skip a due event when another worker won the atomic claim.
    const event = store.claim(candidate.id);
    if (!event) continue;
    try {
      await handler(event.payload);
      store.markProcessed(event.id, now);
      outcomes.push({ id: event.id, status: "processed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "handler_failed";
      if (event.attempts < maxAttempts) {
        const delay = baseRetryDelayMs * (2 ** Math.max(0, event.attempts - 1));
        store.markRetry(event.id, message, now + delay);
        outcomes.push({ id: event.id, status: "retry" });
      } else {
        store.markDead(event.id, message);
        outcomes.push({ id: event.id, status: "dead" });
      }
    }
  }
  return outcomes;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dbPath = process.env.WEBHOOK_INBOX_DB ?? "./webhook-inbox.sqlite";
  const secret = process.env.WEBHOOK_INBOX_SECRET;
  if (!secret) {
    console.error("WEBHOOK_INBOX_SECRET is required");
    process.exit(1);
  }
  const { server } = createWebhookInboxServer({ dbPath, secret });
  server.listen(Number(process.env.PORT ?? 8080), "127.0.0.1", () => {
    console.error(`webhook inbox listening on ${process.env.PORT ?? 8080}`);
  });
}
