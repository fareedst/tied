/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_ANALYSIS]
 * AST-based identifier extraction for JavaScript and TypeScript sources.
 */

import ts from "typescript";

export type AstIdentifierHit = {
  display: string;
  line: number;
  column: number;
};

const AST_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

export function isAstExtractableExtension(ext: string): boolean {
  return AST_EXTENSIONS.has(ext.toLowerCase());
}

function scriptKindForExtension(ext: string): ts.ScriptKind {
  switch (ext.toLowerCase()) {
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".ts":
      return ts.ScriptKind.TS;
    default:
      return ts.ScriptKind.JS;
  }
}

function addIdentifier(
  sourceFile: ts.SourceFile,
  name: ts.Identifier,
  results: AstIdentifierHit[],
): void {
  const pos = name.getStart(sourceFile, false);
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  results.push({ display: name.text, line: line + 1, column: character });
}

function isDeclarationIdentifier(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (!parent) return false;
  if (ts.isVariableDeclaration(parent) && parent.name === node) return true;
  if (ts.isFunctionDeclaration(parent) && parent.name === node) return true;
  if (ts.isClassDeclaration(parent) && parent.name === node) return true;
  if (ts.isMethodDeclaration(parent) && parent.name === node) return true;
  if (ts.isPropertyDeclaration(parent) && parent.name === node) return true;
  if (ts.isParameter(parent) && parent.name === node) return true;
  if (ts.isImportSpecifier(parent) && parent.name === node) return true;
  if (ts.isExportSpecifier(parent) && (parent.name === node || parent.propertyName === node)) return true;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return true;
  if (ts.isBindingElement(parent) && parent.name === node) return true;
  if (ts.isEnumDeclaration(parent) && parent.name === node) return true;
  if (ts.isInterfaceDeclaration(parent) && parent.name === node) return true;
  if (ts.isTypeAliasDeclaration(parent) && parent.name === node) return true;
  if (ts.isModuleDeclaration(parent) && parent.name === node) return true;
  return false;
}

/**
 * [IMPL-VOCABULARY_ANALYSIS] [REQ-VOCABULARY_ANALYSIS]
 * How: parse with TypeScript compiler API and collect declaration-style identifiers.
 */
export function extractAstIdentifiers(text: string, relPosix: string): AstIdentifierHit[] {
  const ext = relPosix.includes(".") ? `.${relPosix.split(".").pop()}` : "";
  if (!isAstExtractableExtension(ext)) return [];

  const sourceFile = ts.createSourceFile(
    relPosix,
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForExtension(ext),
  );

  const results: AstIdentifierHit[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && isDeclarationIdentifier(node)) {
      addIdentifier(sourceFile, node, results);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return results;
}
