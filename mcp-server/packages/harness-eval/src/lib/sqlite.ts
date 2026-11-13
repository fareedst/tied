/** Node built-in sqlite (Node 22+); local re-export for tsc without upstream types. */
// @ts-expect-error node:sqlite ships with Node 22+ runtime
import { DatabaseSync } from "node:sqlite";

export { DatabaseSync };

export type EvalDatabase = InstanceType<typeof DatabaseSync>;
