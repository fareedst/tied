/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
 * Checklist {{VAR}} expansion (Go checklist/placeholders.go parity).
 */
const checklistPlaceholderPattern = /\{\{([A-Za-z0-9_]+)\}\}/g;

export function expandPlaceholders(
  s: string,
  vars: Record<string, string>,
): string {
  if (Object.keys(vars).length === 0) {
    return s;
  }
  return s.replace(checklistPlaceholderPattern, (m, key: string) => {
    if (key in vars) {
      return vars[key] ?? m;
    }
    return m;
  });
}

export function hasResidualChecklistPlaceholder(s: string): boolean {
  checklistPlaceholderPattern.lastIndex = 0;
  return checklistPlaceholderPattern.test(s);
}

export function replaceStubRefsInText(
  s: string,
  stubMap: Record<string, string>,
  stubKeys: string[],
): string {
  let out = s;
  for (const k of stubKeys) {
    const lab = stubMap[k];
    if (lab !== undefined) {
      out = out.split(k).join(lab);
    }
  }
  return out;
}

export function expandThenStub(
  s: string,
  vars: Record<string, string>,
  stubMap: Record<string, string>,
  stubKeys: string[],
): string {
  return replaceStubRefsInText(
    expandPlaceholders(s, vars),
    stubMap,
    stubKeys,
  );
}

export function trimExpandThenStub(
  s: string,
  vars: Record<string, string>,
  stubMap: Record<string, string>,
  stubKeys: string[],
): string {
  return expandThenStub(s.trim(), vars, stubMap, stubKeys);
}
