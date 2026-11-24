/** Metadata reviewed against the official TUFLOW command appendices.
 * A missing entry means "no audited editor suggestion", not invalid model syntax.
 */
import type { TuflowCommand, ControlFileCategory, LeftSideSuffixGroup } from './types';

export type AuditedValueKind = 'enum' | 'file' | 'number' | 'tuple' | 'text';

export interface AuditedTuflowCommand extends TuflowCommand {
    /** Official command appendix covering this command and control-file context. */
    sourceUrl: string;
    /** Optional left-hand modifiers verified for this command. */
    suffixGroups?: LeftSideSuffixGroup[];
    /** Controls editor suggestions; never guess values for untyped free text. */
    valueKind: AuditedValueKind;
    /** Only literal choices documented by the source. */
    enumValues?: string[];
    /** Ordered arguments when the source explicitly documents a structure. */
    argumentNames?: string[];
}

type AuditedEntry = Omit<AuditedTuflowCommand, 'category' | 'sourceUrl'>;

export function defineAuditedCommands(
    category: ControlFileCategory,
    sourceUrl: string,
    entries: AuditedEntry[],
): AuditedTuflowCommand[] {
    return entries.map((entry) => ({ ...entry, category, sourceUrl }));
}

export function isAuditedCommand(command: TuflowCommand): command is AuditedTuflowCommand {
    return typeof (command as Partial<AuditedTuflowCommand>).sourceUrl === 'string'
        && typeof (command as Partial<AuditedTuflowCommand>).valueKind === 'string';
}
