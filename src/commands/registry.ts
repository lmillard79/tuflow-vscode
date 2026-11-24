import { normalizeCommandName, parseTuflowLine } from './lineParser';
import type { ParsedTuflowLine } from './lineParser';
import type { CommandDefinition, ControlFileCategory } from './types';
import { controlFileCategories } from './types';

const categoryByExtension: Readonly<Record<string, ControlFileCategory>> = {
    '.tcf': 'TCF', '.tgc': 'TGC', '.tbc': 'TBC',
    '.ecf': 'ECF', '.trfc': 'TRFC', '.qcf': 'QCF'
};
const empty: readonly CommandDefinition[] = Object.freeze([]);

export function getControlFileCategory(fileNameOrExtension: string): ControlFileCategory | undefined {
    const input = fileNameOrExtension.trim().toLowerCase();
    const suffix = /^\.?[a-z0-9]+$/.test(input)
        ? '.' + input.replace(/^\./, '')
        : /\.[a-z0-9]+$/.exec(input)?.[0];
    return suffix ? categoryByExtension[suffix] : undefined;
}

function commandNames(definition: CommandDefinition): readonly string[] {
    let names = [normalizeCommandName(definition.canonicalName)];
    for (const group of definition.suffixGroups) {
        const next = group.optional ? [...names] : [];
        for (const name of names) {
            for (const alternative of group.alternatives) {
                next.push(normalizeCommandName(name + ' ' + alternative));
            }
        }
        names = next;
    }
    return [...new Set(names)];
}

export interface CommandRegistry {
    readonly all: readonly CommandDefinition[];
    forFile(fileNameOrExtension: string): readonly CommandDefinition[];
    lookup(fileNameOrExtension: string, phraseOrLine: string | ParsedTuflowLine): readonly CommandDefinition[];
}

/** Immutable snapshot of the plain command metadata supplied by callers. */
function snapshotMetadata<T>(value: T, copies = new WeakMap<object, object>()): T {
    if (value === null || typeof value !== 'object') return value;
    const previous = copies.get(value);
    if (previous) return previous as T;
    if (Array.isArray(value)) {
        const output: unknown[] = [];
        copies.set(value, output);
        for (const item of value) output.push(snapshotMetadata(item, copies));
        return Object.freeze(output) as T;
    }
    const output: Record<string, unknown> = {};
    copies.set(value, output);
    for (const [key, item] of Object.entries(value)) {
        Object.defineProperty(output, key, {
            enumerable: true, configurable: true, writable: true,
            value: snapshotMetadata(item, copies)
        });
    }
    return Object.freeze(output) as T;
}

/** Pure, exact, file-context-aware registry. Unknowns return [] without diagnostics. */
export function createCommandRegistry(definitions: readonly CommandDefinition[]): CommandRegistry {
    const snapshots = definitions.map(definition => snapshotMetadata(definition));
    const categories = new Map<ControlFileCategory, CommandDefinition[]>();
    const names = new Map<ControlFileCategory, Map<string, readonly CommandDefinition[]>>();
    for (const category of controlFileCategories) {
        categories.set(category, []);
        names.set(category, new Map());
    }
    for (const definition of snapshots) {
        for (const category of definition.categories) {
            const categoryEntries = categories.get(category);
            const nameEntries = names.get(category);
            if (!categoryEntries || !nameEntries) {
                throw new Error('Unsupported command category: ' + category);
            }
            categoryEntries.push(definition);
            for (const name of commandNames(definition)) {
                nameEntries.set(name, Object.freeze([...(nameEntries.get(name) ?? []), definition]));
            }
        }
    }
    const frozenByCategory = new Map<ControlFileCategory, readonly CommandDefinition[]>();
    for (const category of controlFileCategories) {
        frozenByCategory.set(category, Object.freeze([...(categories.get(category) ?? [])]));
    }
    return {
        all: Object.freeze([...snapshots]),
        forFile(fileNameOrExtension) {
            const category = getControlFileCategory(fileNameOrExtension);
            return category ? frozenByCategory.get(category) ?? empty : empty;
        },
        lookup(fileNameOrExtension, phraseOrLine) {
            const category = getControlFileCategory(fileNameOrExtension);
            if (!category) return empty;
            const leftHand = typeof phraseOrLine === 'string'
                ? parseTuflowLine(phraseOrLine).leftHand?.text
                : phraseOrLine.leftHand?.text;
            if (!leftHand) return empty;
            return names.get(category)?.get(normalizeCommandName(leftHand)) ?? empty;
        }
    };
}
