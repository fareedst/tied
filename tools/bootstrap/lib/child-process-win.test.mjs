import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { childProcessSpawnOptions } from "./child-process-win.mjs";

describe("childProcessSpawnOptions [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM]", () => {
  it("passes through on non-win32", () => {
    const original = process.platform;
    try {
      Object.defineProperty(process, "platform", { value: "linux" });
      assert.deepEqual(childProcessSpawnOptions({ stdio: "pipe" }), { stdio: "pipe" });
    } finally {
      Object.defineProperty(process, "platform", { value: original });
    }
  });

  it("sets windowsHide on win32", () => {
    const original = process.platform;
    try {
      Object.defineProperty(process, "platform", { value: "win32" });
      assert.deepEqual(childProcessSpawnOptions({ stdio: "inherit" }), {
        stdio: "inherit",
        windowsHide: true,
      });
    } finally {
      Object.defineProperty(process, "platform", { value: original });
    }
  });
});
