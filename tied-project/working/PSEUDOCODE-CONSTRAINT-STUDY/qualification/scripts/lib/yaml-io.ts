import { createRequire } from "node:module";
import { MCP_SERVER_ROOT } from "./constants.ts";

const require = createRequire(`${MCP_SERVER_ROOT}/package.json`);
const yaml = require("js-yaml") as typeof import("js-yaml");

export { yaml };
