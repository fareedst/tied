/**
 * STDD 1.0.0 monolithic to TIED v1.5.0+ YAML index converter.
 * Re-exports parser, YAML generator, and detail file generator.
 */

export {
  parseMonolithicRequirements,
  parseMonolithicArchitecture,
  parseMonolithicImplementation,
  parseFieldListText,
  parseHeadingAndLabelSections,
  type ParsedRequirement,
  type ParsedArchitectureDecision,
  type ParsedImplementationDecision,
  type ImplementationFieldEntry,
} from "./parser.js";

export {
  requirementToYamlRecord,
  architectureToYamlRecord,
  implementationToYamlRecord,
} from "./yaml-generator.js";

export {
  requirementDetailMarkdown,
  architectureDetailMarkdown,
  implementationDetailMarkdown,
} from "./detail-generator.js";

export {
  resolveOutputBase,
  normalizeTokenFormat,
  convertMonolithicRequirements,
  convertMonolithicArchitecture,
  convertMonolithicImplementation,
  convertMonolithicAll,
  type TokenFormat,
  type ConversionOptions,
  type ConversionSummary,
  type ConvertAllOptions,
  type ConvertAllSummary,
} from "./runner.js";
