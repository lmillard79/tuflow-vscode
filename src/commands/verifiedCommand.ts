/**
 * TCF/TGC editor-only command specifications, mapped to Agent C's shared schema.
 * This is a source-backed suggestion catalogue, not a model validator.
 */
import { normalizeCommandName } from './lineParser';
import type { CommandDefinition, CommandValueKind, LeftSideSuffixGroup } from './types';

export type AuditedValueKind =
    | 'hours' | 'seconds' | 'distance' | 'degrees' | 'integer'
    | 'integer-pair' | 'distance-pair' | 'coordinate-pair'
    | 'file' | 'folder' | 'gis-layer' | 'grid'
    | 'numeric-or-enum' | 'seconds-or-auto' | 'enum' | 'enum-list' | 'tokens';

export type VerifiedTuflowCommand = CommandDefinition;

export interface VerifiedCommandSpec {
    readonly name: string;
    readonly description: string;
    readonly valueKind: AuditedValueKind;
    readonly valueSyntax: string;
    /** Source-verified positional arguments, only for structured commands. */
    readonly argumentNames?: readonly string[];
    readonly examples: readonly string[];
    readonly notes?: string;
    readonly referenceCommand?: string;
    readonly permittedValues?: readonly string[];
    readonly suffixGroups?: readonly LeftSideSuffixGroup[];
}

const valueKinds: Readonly<Record<AuditedValueKind, CommandValueKind>> = {
    hours: 'number', seconds: 'number', distance: 'number', degrees: 'number',
    integer: 'number', 'integer-pair': 'number-pair',
    'distance-pair': 'number-pair', 'coordinate-pair': 'number-pair',
    file: 'file-path', folder: 'file-path', 'gis-layer': 'file-path', grid: 'file-path',
    'numeric-or-enum': 'number-or-keyword', 'seconds-or-auto': 'number-or-keyword',
    enum: 'keyword', 'enum-list': 'token-list', tokens: 'token-list'
};

/** Create a verified entry with contextual identity and official provenance. */
export function verifiedCommand(
    category: 'TCF' | 'TGC',
    documentationUrl: string,
    spec: VerifiedCommandSpec
): VerifiedTuflowCommand {
    return Object.freeze({
        id: category + ':' + normalizeCommandName(spec.name),
        canonicalName: spec.name,
        categories: Object.freeze([category]),
        name: spec.name,
        category,
        description: spec.description,
        parameters: Object.freeze([spec.valueSyntax]),
        argumentNames: spec.argumentNames ? Object.freeze([...spec.argumentNames]) : undefined,
        syntax: spec.name + ' == ' + spec.valueSyntax,
        examples: Object.freeze([...spec.examples]),
        notes: spec.notes,
        suffixGroups: Object.freeze([...(spec.suffixGroups ?? [])]),
        valueKind: valueKinds[spec.valueKind],
        allowedValues: spec.permittedValues?.length
            ? Object.freeze([...spec.permittedValues]) : undefined,
        safeExamples: Object.freeze([...spec.examples]),
        provenance: Object.freeze({
            url: documentationUrl,
            section: 'Appendix ' + (category === 'TCF' ? 'A' : 'C') +
                ' (2026.3), "' + (spec.referenceCommand ?? spec.name) + '"',
            auditStatus: 'verified' as const,
            verifiedFields: Object.freeze([
                'canonicalName', 'categories', 'suffixGroups', 'valueKind',
                'allowedValues', 'description', 'syntax', 'safeExamples', 'notes',
                ...(spec.argumentNames?.length ? ['argumentNames'] : [])
            ])
        })
    });
}
