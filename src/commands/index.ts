/**
 * Editor-only registry combining the documented TCF/TGC and TBC/ECF/TRFC/QCF catalogues.
 */
import { tcfCommands } from './tcfCommands';
import { tgcCommands } from './tgcCommands';
import { tbcCommands } from './tbcCommands';
import { ecfCommands } from './ecfCommands';
import { trfcCommands } from './trfcCommands';
import { qcfCommands } from './qcfCommands';
import { normalizeCommandName } from './lineParser';
import { createCommandRegistry } from './registry';
import { isAuditedCommand } from './audited';
import type { AuditedTuflowCommand } from './audited';
import type { TuflowCommand, CommandDefinition, CommandValueKind, ControlFileCategory, LeftSideSuffixGroup } from './types';
import type { ParsedTuflowLine } from './lineParser';

export type { TuflowCommand, CommandDefinition, CommandProvenance, CommandValueKind, ControlFileCategory, LeftSideSuffixGroup } from './types';
export type { ParsedTuflowLine, EditorPosition, EditorRange, LineSegment } from './lineParser';
export { parseTuflowLine, normalizeCommandName } from './lineParser';
export { createCommandRegistry, getControlFileCategory } from './registry';

const manuals: Record<ControlFileCategory, { readonly appendix: string; readonly url: string }> = {
    TCF: { appendix: 'Appendix A — TCF Commands', url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/TCFCommands-1.html' },
    ECF: { appendix: 'Appendix B — ECF Commands', url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/ECFCommands-1.html' },
    TGC: { appendix: 'Appendix C — TGC Commands', url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/TGCCommands-1.html' },
    TBC: { appendix: 'Appendix D — TBC Commands', url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/TBCCommands-1.html' },
    TRFC: { appendix: 'Appendix F — TRFC Commands', url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/TRFCCommands-1.html' },
    QCF: { appendix: 'Appendix H — QCF Commands', url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/QCFCommands-1.html' }
};

interface VerifiedMetadata {
    readonly valueKind?: CommandValueKind;
    readonly allowedValues?: readonly string[];
    readonly suffixGroups?: readonly LeftSideSuffixGroup[];
    readonly safeExamples?: readonly string[];
    readonly verifiedFields: readonly string[];
}

/** Individually verified fields only. Legacy descriptions/examples remain unaudited. */
const verified: Readonly<Record<string, VerifiedMetadata>> = {
    'TGC:read gis z shape': {
        valueKind: 'file-path',
        suffixGroups: [
            { optional: true, alternatives: ['RIDGE', 'MAX', 'RAISE', 'GULLY', 'MIN', 'LOWER'] },
            { optional: true, alternatives: ['XF ON', 'XF OFF', 'Write TIN'] }
        ],
        verifiedFields: ['valueKind', 'suffixGroups']
    },
    'ECF:apply all inverts': {
        valueKind: 'keyword', allowedValues: ['ON', 'OFF'],
        safeExamples: ['Apply All Inverts == ON'],
        verifiedFields: ['valueKind', 'allowedValues', 'safeExamples']
    },
    'ECF:csv time': {
        valueKind: 'keyword', allowedValues: ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
        safeExamples: ['CSV Time == HOURS'],
        verifiedFields: ['valueKind', 'allowedValues', 'safeExamples']
    },
    'TRFC:rf grid format': {
        valueKind: 'keyword', allowedValues: ['ASC', 'FLT', 'NC', 'TIF'],
        safeExamples: ['RF Grid Format == TIF'],
        verifiedFields: ['valueKind', 'allowedValues', 'safeExamples']
    },
    'TRFC:rf interpolation method': {
        valueKind: 'keyword', allowedValues: ['IDW', 'POLYGON', 'TIN'],
        safeExamples: ['RF Interpolation Method == IDW'],
        verifiedFields: ['valueKind', 'allowedValues', 'safeExamples']
    },
    'TRFC:rf grid size (n,m)': { valueKind: 'number-pair', verifiedFields: ['valueKind'] },
    'TRFC:rf grid size (x,y)': { valueKind: 'number-pair', verifiedFields: ['valueKind'] },
    'QCF:base cell size': {
        valueKind: 'number-or-keyword', allowedValues: ['TGC'],
        safeExamples: ['Base Cell Size == TGC'],
        verifiedFields: ['valueKind', 'allowedValues', 'safeExamples']
    },
    'QCF:model origin and extent': {
        valueKind: 'keyword', allowedValues: ['Auto', 'TGC'],
        safeExamples: ['Model Origin and Extent == TGC'],
        verifiedFields: ['valueKind', 'allowedValues', 'safeExamples']
    }
};

function auditedValueKind(command: AuditedTuflowCommand): CommandValueKind {
    switch (command.valueKind) {
        case 'file': return 'file-path';
        case 'enum': return 'keyword';
        case 'number': return command.enumValues?.length ? 'number-or-keyword' : 'number';
        case 'text': return 'free-text';
        case 'tuple':
            // Only comma-separated numeric *pairs* have a proven two-argument signature.
            return command.category === 'TRFC' && (
                command.name === 'RF Grid Origin' || command.name.startsWith('RF Grid Size (')
            ) ? 'number-pair' : 'unknown';
    }
}

function importLegacy(category: ControlFileCategory, commands: readonly TuflowCommand[]): CommandDefinition[] {
    return commands.map((command, index) => {
        if (command.category !== category) throw new Error('Catalogue category mismatch: ' + command.name);
        const fields = verified[category + ':' + normalizeCommandName(command.name)];
        const manual = manuals[category];
        const audited = isAuditedCommand(command) ? command : undefined;
        const verifiedFields = audited
            ? [
                'canonicalName', 'description', 'syntax', 'valueKind', 'sourceUrl',
                ...(audited.enumValues ? ['allowedValues'] : []),
                ...(audited.suffixGroups ? ['suffixGroups'] : []),
                ...(audited.argumentNames ? ['argumentNames'] : [])
            ]
            : fields?.verifiedFields ?? [];
        return Object.freeze({
            ...command,
            // Preserve source-checked argument structure for the interim #3 editor
            // provider; do not treat enum alternatives as separate arguments.
            parameters: audited?.argumentNames ?? (audited ? undefined : command.parameters),
            id: category + ':' + normalizeCommandName(command.name) + ':' + index,
            canonicalName: command.name,
            categories: Object.freeze([category]),
            suffixGroups: audited?.suffixGroups ?? fields?.suffixGroups ?? Object.freeze([]),
            valueKind: audited ? auditedValueKind(audited) : fields?.valueKind ?? 'unknown',
            allowedValues: audited?.enumValues ?? fields?.allowedValues,
            safeExamples: audited
                ? (audited.examples?.length ? audited.examples :
                    (audited.enumValues?.map(value => command.name + ' == ' + value) ?? []))
                : fields?.safeExamples ?? Object.freeze([]),
            provenance: Object.freeze({
                url: audited?.sourceUrl ?? manual.url,
                section: manual.appendix + ', "' + command.name + '"',
                auditStatus: audited ? 'verified' as const : 'needs-audit' as const,
                verifiedFields
            })
        });
    });
}

const registry = createCommandRegistry([
    ...tcfCommands,
    ...tgcCommands,
    ...importLegacy('TBC', tbcCommands),
    ...importLegacy('ECF', ecfCommands),
    ...importLegacy('TRFC', trfcCommands),
    ...importLegacy('QCF', qcfCommands)
]);
export const allTuflowCommands: readonly CommandDefinition[] = registry.all;
export { tcfCommands, tgcCommands, tbcCommands, ecfCommands, trfcCommands, qcfCommands };

export function getCommandsForFile(fileNameOrExtension: string): readonly CommandDefinition[] {
    return registry.forFile(fileNameOrExtension);
}
export function lookupCommandsForFile(
    fileNameOrExtension: string, phraseOrLine: string | ParsedTuflowLine
): readonly CommandDefinition[] {
    return registry.lookup(fileNameOrExtension, phraseOrLine);
}
export function getCommandsByCategory(category: string): readonly CommandDefinition[] {
    const upper = category.toUpperCase() as ControlFileCategory;
    return Object.prototype.hasOwnProperty.call(manuals, upper)
        ? registry.forFile('.' + upper.toLowerCase()) : [];
}
/** Returns every definition, never an arbitrary first global match. */
export function getCommandsByName(name: string): readonly CommandDefinition[] {
    const normalized = normalizeCommandName(name);
    return registry.all.filter(command => normalizeCommandName(command.canonicalName) === normalized);
}
export function searchCommands(query: string): readonly CommandDefinition[] {
    const lower = query.trim().toLowerCase();
    return registry.all.filter(command =>
        command.name.toLowerCase().includes(lower) || command.description.toLowerCase().includes(lower));
}
export const commandCategories = {
    TCF: 'TCF Commands (TUFLOW Control File)',
    TGC: 'TGC Commands (TUFLOW Geometry Control)',
    TBC: 'TBC Commands (TUFLOW Boundary Conditions)',
    ECF: 'ECF Commands (TUFLOW Event Control File)',
    TRFC: 'TRFC Commands (TUFLOW Rainfall Control File)',
    QCF: 'QCF Commands (TUFLOW Quadtree Control File)'
} as const;
/** Compatibility export; new consumers should use getCommandsForFile. */
export const fileTypeCommands = {
    '.tcf': registry.forFile('.tcf'), '.tgc': registry.forFile('.tgc'),
    '.tbc': registry.forFile('.tbc'), '.ecf': registry.forFile('.ecf'),
    '.trfc': registry.forFile('.trfc'), '.qcf': registry.forFile('.qcf')
} as const;
