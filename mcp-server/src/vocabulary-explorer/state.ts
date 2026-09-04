/**
 * [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE]
 * Pure fragment encode/decode and history transitions.
 */

export type ViewerState = {
  q: string;
  sel: string;
  kind: string;
  dir: string;
  fk: string;
  lang: string;
  prod: string;
  minf: string;
  view: string;
};

const DEFAULT_STATE: ViewerState = {
  q: "",
  sel: "",
  kind: "",
  dir: "",
  fk: "",
  lang: "",
  prod: "",
  minf: "",
  view: "frequency",
};

/** [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE] */
export function decodeViewerFragment(fragment: string): ViewerState {
  const raw = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  if (!raw.trim()) return { ...DEFAULT_STATE };
  const params = new URLSearchParams(raw);
  return {
    q: params.get("q") ?? "",
    sel: params.get("sel") ?? "",
    kind: params.get("kind") ?? "",
    dir: params.get("dir") ?? "",
    fk: params.get("fk") ?? "",
    lang: params.get("lang") ?? "",
    prod: params.get("prod") ?? "",
    minf: params.get("minf") ?? "",
    view: params.get("view") ?? "frequency",
  };
}

/** [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE] */
export function encodeViewerFragment(state: ViewerState): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.sel) params.set("sel", state.sel);
  if (state.kind) params.set("kind", state.kind);
  if (state.dir) params.set("dir", state.dir);
  if (state.fk) params.set("fk", state.fk);
  if (state.lang) params.set("lang", state.lang);
  if (state.prod) params.set("prod", state.prod);
  if (state.minf) params.set("minf", state.minf);
  if (state.view && state.view !== "frequency") params.set("view", state.view);
  const s = params.toString();
  return s ? `#${s}` : "";
}

/** [IMPL-VOCABULARY_VIEWER_STATE] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_VIEWER_STATE] */
export function applyHistoryTransition(
  stack: ViewerState[],
  index: number,
  direction: "back" | "forward",
): { index: number; state: ViewerState } {
  if (stack.length === 0) return { index: 0, state: { ...DEFAULT_STATE } };
  let nextIndex = index;
  if (direction === "back") nextIndex = Math.max(0, index - 1);
  else nextIndex = Math.min(stack.length - 1, index + 1);
  return { index: nextIndex, state: { ...stack[nextIndex] } };
}

export function filterTermsForState<T extends { id: string; kind: string; display: string; occurrences: { path: string; file_kind: string }[]; frequency: number }>(
  terms: T[],
  state: ViewerState,
  minFrequency: number,
): T[] {
  const q = state.q.trim().toLowerCase();
  return terms.filter((t) => {
    if (q && !t.display.toLowerCase().includes(q) && !t.id.includes(q)) return false;
    if (state.kind && t.kind !== state.kind) return false;
    if (state.dir && !t.occurrences.some((o) => o.path.startsWith(state.dir))) return false;
    if (state.fk && !t.occurrences.some((o) => o.file_kind === state.fk)) return false;
    if (state.lang) {
      const ext = state.lang === "typescript" ? [".ts", ".tsx"] : state.lang === "javascript" ? [".js", ".jsx", ".mjs"] : [`.${state.lang}`];
      if (!t.occurrences.some((o) => ext.some((e) => o.path.endsWith(e)))) return false;
    }
    if (state.prod === "production" && !t.occurrences.some((o) => o.file_kind === "production")) return false;
    if (state.prod === "test" && !t.occurrences.some((o) => o.file_kind === "test")) return false;
    const minf = state.minf ? Number(state.minf) : minFrequency;
    if (!Number.isNaN(minf) && t.kind === "source_identifier" && t.frequency < minf) return false;
    return true;
  });
}

export { DEFAULT_STATE };
