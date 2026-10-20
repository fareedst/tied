/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: TTY colors honoring NO_COLOR.
 */
const tty = process.stdout.isTTY && !process.env.NO_COLOR;

export const C_OK = tty ? "\x1b[0;32m" : "";
export const C_WARN = tty ? "\x1b[0;33m" : "";
export const C_ERR = tty ? "\x1b[0;31m" : "";
export const C_BOLD = tty ? "\x1b[1m" : "";
export const C_DIM = tty ? "\x1b[2m" : "";
export const C_CYAN = tty ? "\x1b[36m" : "";
export const C_RESET = tty ? "\x1b[0m" : "";

const HR_LINE = "─".repeat(56);

export function writeHr() {
  process.stdout.write(`${C_DIM}${HR_LINE}${C_RESET}\n`);
}

export function writeSection(title) {
  process.stdout.write(`${C_BOLD}${C_CYAN}▶${C_RESET} ${C_BOLD}${title}${C_RESET}\n`);
}

export function writeDim(line) {
  process.stdout.write(`${C_DIM}${line}${C_RESET}\n`);
}

/**
 * @param {string} message
 * @param {string[]} hints
 */
export function writeErrorHints(message, hints = []) {
  process.stderr.write(`\n${C_ERR}ERROR:${C_RESET} ${message}\n`);
  if (hints.length > 0) {
    process.stderr.write(`${C_BOLD}Hints:${C_RESET}\n`);
    for (const hint of hints) {
      process.stderr.write(`  • ${hint}\n`);
    }
  }
  process.stderr.write(`${C_DIM}${HR_LINE}${C_RESET}\n`);
}

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
