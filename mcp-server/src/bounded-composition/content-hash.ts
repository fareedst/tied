/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 */

import { createHash } from "node:crypto";

import { stableJsonForHash } from "../storage-dump.js";

export function contentHashHex(input: string | Buffer): string {
  const hash = createHash("sha256").update(input).digest("hex");
  return `sha256:${hash}`;
}

export function stableJsonHash(value: unknown): string {
  return contentHashHex(stableJsonForHash(value));
}
