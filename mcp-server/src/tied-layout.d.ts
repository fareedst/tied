export declare const PROJECT_DIR_NAME: "tied-project";
export declare const BUNDLE_DIR_NAME: "tied-bundle";
export declare const LEGACY_PROJECT_DIR_NAME: "tied";
export type TiedLayout = {
    projectRoot: string;
    tiedDir: string;
    bundleDir: string;
    projectConfigPath: string;
    installConfigPath: string;
    methodologyIndexRoot: string;
    docsDir: string;
    methodVocabDir: string;
    templatesDir: string;
    workingCommittedRoot: string;
    workingLocalRoot: string;
    reportsDir: string;
    legacyProjectDir: boolean;
};
export declare function resolveProjectDirName(projectRoot: string): {
    dirName: string;
    legacy: boolean;
};
export declare function resolveTiedLayout(projectRoot: string): TiedLayout;
/** Flattened methodology corpus on store checkout (tied-bundle, templates, or legacy tied/methodology). */
export declare function resolveStoreMethodologySourceDir(repoRoot: string): string;
export declare function detectLegacyLayout(projectRoot: string, opts?: {
    allowLegacyProjectDir?: boolean;
}): {
    detected: false;
} | {
    detected: true;
    code: string;
    hint: string;
    paths: string[];
};
