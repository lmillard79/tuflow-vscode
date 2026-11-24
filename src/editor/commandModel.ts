/**
 * Pure, single-line editor assistance. The shared parser and registry own command
 * recognition; this module never validates paths, scenarios or future syntax.
 */
import {
    getCommandsByName, getCommandsForFile, getControlFileCategory,
    lookupCommandsForFile, normalizeCommandName, parseTuflowLine
} from '../commands';
import type { CommandDefinition, ParsedTuflowLine } from '../commands';

export interface TextRangePlan {
    readonly line: number;
    readonly start: number;
    readonly end: number;
}
export interface CompletionPlan {
    readonly label: string;
    readonly kind: 'command' | 'keyword' | 'file';
    readonly insertText: string;
    readonly range: TextRangePlan;
    readonly description: string;
    readonly documentation: string;
    readonly snippet?: boolean;
}
export interface HoverPlan {
    readonly range: TextRangePlan;
    readonly documentation: string;
}
export interface SignaturePlan {
    readonly label: string;
    readonly documentation: string;
    readonly parameters: readonly string[];
    readonly activeParameter: number;
}

function boundedCursor(line: string, character: number): number {
    return Math.max(0, Math.min(line.length, Math.trunc(character)));
}
function inComment(parsed: ParsedTuflowLine, character: number): boolean {
    return parsed.comment !== null && character >= parsed.comment.range.start.character;
}
function replaceRange(line: number, start: number, end: number): TextRangePlan {
    return { line, start, end };
}
function commandVariants(command: CommandDefinition): string[] {
    let variants = [command.canonicalName];
    for (const group of command.suffixGroups) {
        const next = group.optional ? [...variants] : [];
        for (const variant of variants) {
            for (const alternative of group.alternatives) {
                next.push(variant + ' ' + alternative);
            }
        }
        variants = next;
    }
    return [...new Set(variants)];
}
function matchesPrefix(candidate: string, prefix: string): boolean {
    return normalizeCommandName(candidate).startsWith(normalizeCommandName(prefix));
}

/** Protect all syntax metacharacters, including literal <...> operand names. */
function markdownCodeSpan(value: string): string {
    const runs = value.match(/`+/g);
    const fence = '`'.repeat(runs ? Math.max(...runs.map(run => run.length)) + 1 : 1);
    // CommonMark code spans trim a surrounding space when the content has
    // non-space characters, allowing syntax that starts/ends with a backtick.
    const pad = value.startsWith('`') || value.endsWith('`') ? ' ' : '';
    return fence + pad + value + pad + fence;
}

export function documentationForCommand(command: CommandDefinition): string {
    const audited = command.provenance.auditStatus === 'verified';
    let documentation = '**' + command.canonicalName + '**\n\n' + command.description;
    if (command.syntax && audited) {
        // Render source-checked syntax as literal Markdown code. Unquoted
        // <time_in_hours> and other operand placeholders are parsed as HTML
        // tags by VS Code's Markdown renderer and disappear from the hover.
        documentation += '\n\n**Syntax:** ' + markdownCodeSpan(command.syntax);
    }
    if (command.allowedValues?.length) {
        documentation += '\n\n**Documented values:** ' + command.allowedValues.join(', ');
    }
    if (command.safeExamples.length) {
        documentation += '\n\n**Verified examples:**\n' +
            command.safeExamples.map(example => '- ' + example).join('\n');
    }
    if (command.notes) documentation += '\n\n**Notes:** ' + command.notes;
    if (!audited) {
        documentation += '\n\n*This catalogue entry has not yet completed its documentation audit.*';
    }
    documentation += '\n\n[Official TUFLOW documentation](' + command.provenance.url + ')';
    return documentation;
}

/**
 * Returns editable insertion plans with half-open UTF-16 replacement ranges.
 * Never completes a command from a different control-file category.
 */
export function planCompletions(
    fileName: string, line: string, character: number, lineNumber = 0
): readonly CompletionPlan[] {
    const cursor = boundedCursor(line, character);
    const parsed = parseTuflowLine(line, lineNumber);
    if (inComment(parsed, cursor)) return [];

    const entries = getCommandsForFile(fileName);
    if (entries.length === 0) return [];

    const equals = parsed.delimiter;
    const inValue = equals !== null && cursor >= equals.range.end.character;
    if (!inValue) {
        const left = parsed.leftHand;
        // VS Code requires a completion replacement range to contain the cursor.
        // The parser trims trailing whitespace, so extend through a space trigger
        // without consuming the existing delimiter, value or inline comment.
        if ((left && cursor < left.range.start.character) ||
            (equals && cursor > equals.range.start.character &&
                cursor < equals.range.end.character)) return [];
        const start = left?.range.start.character ?? cursor;
        const leftEnd = left?.range.end.character ?? cursor;
        const end = Math.max(leftEnd, cursor);
        const prefix = line.slice(start, Math.min(cursor, leftEnd));
        const range = replaceRange(lineNumber, start, end);
        const needsGapBeforeEquals = equals !== null && end >= equals.range.start.character;
        const plans: CompletionPlan[] = [];
        const seen = new Set<string>();
        for (const command of entries) {
            for (const name of commandVariants(command)) {
                if (!matchesPrefix(name, prefix)) continue;
                const key = normalizeCommandName(name);
                if (seen.has(key)) continue;
                seen.add(key);
                plans.push({
                    label: name, kind: 'command',
                    insertText: name + (equals ? (needsGapBeforeEquals ? ' ' : '') : ' == '),
                    range, description: command.description,
                    documentation: documentationForCommand(command)
                });
            }
        }
        return plans;
    }

    const matches = lookupCommandsForFile(fileName, parsed);
    if (!matches.length) return [];
    const value = parsed.value;
    if (value && (cursor < value.range.start.character ||
        cursor > value.range.end.character)) return [];
    const start = value?.range.start.character ?? cursor;
    const end = value?.range.end.character ?? cursor;
    const prefix = line.slice(start, Math.min(cursor, end));
    const range = replaceRange(lineNumber, start, end);
    const plans: CompletionPlan[] = [];
    const seen = new Set<string>();

    for (const command of matches) {
        for (const keyword of command.allowedValues ?? []) {
            if (!matchesPrefix(keyword, prefix)) continue;
            const key = normalizeCommandName(keyword);
            if (seen.has(key)) continue;
            seen.add(key);
            plans.push({
                label: keyword, kind: 'keyword', insertText: keyword, range,
                description: command.description,
                documentation: documentationForCommand(command)
            });
        }
        // A filename placeholder is appropriate only when the typed registry
        // specifically identifies a file argument, and the value is still empty.
        if (command.valueKind === 'file-path' && value === null &&
            !seen.has('file-path')) {
            seen.add('file-path');
            plans.push({
                label: 'file path', kind: 'file',
                insertText: '$' + '{1:filename}', snippet: true, range,
                description: 'Enter the referenced file or GIS layer.',
                documentation: documentationForCommand(command)
            });
        }
    }
    return plans;
}

export function planHover(
    fileName: string, line: string, character: number, lineNumber = 0
): HoverPlan | undefined {
    const cursor = boundedCursor(line, character);
    const parsed = parseTuflowLine(line, lineNumber);
    const left = parsed.leftHand;
    if (!left || inComment(parsed, cursor) ||
        cursor < left.range.start.character || cursor >= left.range.end.character) {
        return undefined;
    }
    const scoped = lookupCommandsForFile(fileName, parsed);
    let matches = scoped;
    if (!matches.length && !getControlFileCategory(fileName)) {
        // TEF files can inherit TCF/ECF commands. TRD includes and untitled
        // TUFLOW editors retain exact-name help but not global completions.
        const extension = /\.[a-z0-9]+$/i.exec(fileName)?.[0].toLowerCase();
        const candidates = getCommandsByName(left.text);
        const inherited = extension === '.tef'
            ? candidates.filter(command => command.categories.some(
                category => category === 'TCF' || category === 'ECF'))
            : candidates;
        matches = inherited.slice(0, 1);
    }
    if (!matches.length) return undefined;
    return {
        range: replaceRange(lineNumber, left.range.start.character, left.range.end.character),
        documentation: matches.map(documentationForCommand).join('\n\n---\n\n')
    };
}

function separatorsBeforeCursor(line: string, sep: ',' | '|'): number {
    let quote: '"' | "'" | null = null;
    let count = 0;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (quote) {
            if (char === quote) {
                if (line[i + 1] === quote) i++;
                else quote = null;
            }
        } else if ((char === '"' || char === "'") &&
            (i === 0 || /[\s=,(|]/.test(line[i - 1]))) {
            // Follow the shared parser: O'Brien is not an opening quote.
            quote = char;
        } else if (char === sep) {
            count++;
        }
    }
    return count;
}

/**
 * Only audited, explicitly structured multi-argument values receive signatures.
 * Single-value enums, free text and unverified legacy "parameters" never do.
 */
export function planSignature(
    fileName: string, line: string, character: number, lineNumber = 0
): SignaturePlan | undefined {
    const cursor = boundedCursor(line, character);
    const parsed = parseTuflowLine(line, lineNumber);
    if (!parsed.delimiter || cursor < parsed.delimiter.range.end.character ||
        inComment(parsed, cursor)) {
        return undefined;
    }
    const typed = line.slice(parsed.delimiter.range.end.character, cursor).trim();
    for (const command of lookupCommandsForFile(fileName, parsed)) {
        if (command.provenance.auditStatus !== 'verified') continue;
        const names = command.argumentNames;
        if (!names || names.length < 2) continue;
        const rhsSyntax = command.syntax?.split('==').slice(1).join('==') ?? '';
        const separator: ',' | '|' | undefined = rhsSyntax.includes(',')
            ? ',' : rhsSyntax.includes(' | ') ? '|' : undefined;
        if (!separator) continue;
        if (command.allowedValues?.some(value =>
            normalizeCommandName(value) === normalizeCommandName(typed))) {
            continue; // A complete standalone keyword is not an argument tuple.
        }
        // Culvert Zero Coefficients accepts standalone choices: only show its
        // five-number signature once comma-separated values are being entered.
        if (command.canonicalName === 'Culvert Zero Coefficients' &&
            !typed.includes(',')) continue;
        const active = separatorsBeforeCursor(typed, separator);
        if (active >= names.length) continue;
        return {
            label: command.canonicalName + ' == ' + names.join(separator + ' '),
            documentation: documentationForCommand(command),
            parameters: names,
            activeParameter: active
        };
    }
    return undefined;
}
