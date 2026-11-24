/** Shared editor-only TUFLOW command types. No validation or filesystem access. */
export const controlFileCategories = ['TCF', 'TGC', 'TBC', 'ECF', 'TRFC', 'QCF'] as const;
export type ControlFileCategory = typeof controlFileCategories[number];

export interface TuflowCommand {
    readonly name: string;
    readonly description: string;
    readonly category: ControlFileCategory;
    readonly parameters?: readonly string[];
    readonly examples?: readonly string[];
    readonly syntax?: string;
    readonly notes?: string;
}

export type CommandValueKind =
    | 'unknown' | 'file-path' | 'number' | 'number-pair'
    | 'keyword' | 'number-or-keyword' | 'token-list' | 'free-text';

/** Optional modifier groups, in documented order, after the canonical command. */
export interface LeftSideSuffixGroup {
    readonly alternatives: readonly string[];
    readonly optional: boolean;
}

export interface CommandProvenance {
    readonly url: string;
    readonly section: string;
    /** Legacy descriptions, examples and parameters are not yet independently audited. */
    readonly auditStatus: 'needs-audit' | 'verified';
    readonly verifiedFields: readonly string[];
}

export interface CommandDefinition extends TuflowCommand {
    readonly id: string;
    readonly canonicalName: string;
    readonly categories: readonly ControlFileCategory[];
    readonly suffixGroups: readonly LeftSideSuffixGroup[];
    readonly valueKind: CommandValueKind;
    /** Verified keywords; mixed-value commands may also accept numbers. */
    readonly allowedValues?: readonly string[];
    /** Audited ordered argument labels; not a list of keyword choices. */
    readonly argumentNames?: readonly string[];
    readonly safeExamples: readonly string[];
    readonly provenance: CommandProvenance;
}
