/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: TTY colors honoring NO_COLOR.
 */
const tty = process.stdout.isTTY && !process.env.NO_COLOR;

export const C_OK = tty ? "\x1b[0;32m" : "";
export const C_WARN = tty ? "\x1b[0;33m" : "";
export const C_ERR = tty ? "\x1b[0;31m" : "";
export const C_RESET = tty ? "\x1b[0m" : "";

export function sayOk(msg) {
  process.stdout.write(`${C_OK}${msg}${C_RESET}\n`);
}

export function sayWarn(msg) {
  process.stdout.write(`${C_WARN}${msg}${C_RESET}\n`);
}

export function sayErr(msg) {
  process.stderr.write(`${C_ERR}${msg}${C_RESET}\n`);
}

export function sayXOfYClient(x, y, msg) {
  if (y > 0 && x === y) sayOk(msg);
  else sayWarn(msg);
}
