export type WorkingArtifactKind = "committed" | "local";
/** Segments under `{working}/{REQ}/` routed to tied-bundle/working (local). */
export declare const LOCAL_WORKING_PREFIXES: readonly ["gates/", "gate-", "adversarial-inquiry/", "adherence/", "jev/", "pseudocode-analysis/"];
/**
 * Classify a path relative to the per-request working folder (no token prefix).
 */
export declare function classifyWorkingRelativePath(relativePath: string): WorkingArtifactKind;
/** Store / brownfield: root `working/` until tied/{project}/working exists. */
export declare function isUndividedWorkingLayout(projectRoot: string): boolean;
export declare function resolveRequestWorkingBase(projectRoot: string, requestToken: string, kind: WorkingArtifactKind): string;
export declare function resolveWorkingPath(projectRoot: string, requestToken: string, ...parts: string[]): string;
/** Posix path relative to project root (for receipts, CLI defaults). */
export declare function workingPathRelativeToProject(projectRoot: string, requestToken: string, ...parts: string[]): string;
/** Global paths under the local working root (not scoped to a REQ token). */
export declare function resolveGlobalLocalWorkingPath(projectRoot: string, ...parts: string[]): string;
export declare function globalLocalWorkingRelPrefix(projectRoot: string): string;
/** Posix prefix for committed per-REQ working (tied/working or undivided working). */
export declare function committedWorkingRelPrefix(projectRoot: string): string;
export declare function resolveCommittedWorkingPath(projectRoot: string, ...parts: string[]): string;
export declare function committedWorkingFileRel(projectRoot: string, ...parts: string[]): string;
/** List REQ-* tokens present under committed and/or local working roots. */
export declare function listRequestWorkingTokens(projectRoot: string): string[];
/** True when absPath is under committed, local, or undivided root working tree. */
export declare function isPathUnderProjectWorking(projectRoot: string, absPath: string): boolean;
