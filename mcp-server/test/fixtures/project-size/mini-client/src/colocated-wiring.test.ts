import { it } from "node:test";
import assert from "node:assert/strict";

import { a } from "./helpers/a.js";
import { b } from "./helpers/b.js";

it("wires a and b", () => {
  assert.equal(a() + b(), 3);
});

it("wires again", () => {
  assert.ok(a() < b());
});
