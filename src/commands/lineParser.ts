/**
 * Conservative, pure single-line parser; ranges are UTF-16 half-open
 * VS Code-compatible positions, with no dependency on VS Code or IO.
 */
export interface EditorPosition {
    readonly line: number;
    readonly character: number;
}
export interface EditorRange {
    readonly start: EditorPosition;
    readonly end: EditorPosition;
}
export interface LineSegment {
    readonly text: string;
    readonly range: EditorRange;
}
export interface ParsedTuflowLine {
    readonly lineNumber: number;
    readonly leftHand: LineSegment | null;
    readonly delimiter: LineSegment | null;
    readonly value: LineSegment | null;
    readonly comment: LineSegment | null;
    /** An incomplete line is not an error. */
    readonly kind: 'empty' | 'comment' | 'assignment' | 'incomplete';
}

function segment(text: string, line: number, start: number, end: number): LineSegment {
    return {
        text: text.slice(start, end),
        range: {
            start: { line, character: start },
            end: { line, character: end }
        }
    };
}

function trimmedSegment(text: string, line: number, from: number, to: number): LineSegment | null {
    let start = from;
    let end = to;
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    return start < end ? segment(text, line, start, end) : null;
}

/** Parse the first unquoted "==" delimiter and first unquoted "#" or "!" comment. */
export function parseTuflowLine(text: string, lineNumber = 0): ParsedTuflowLine {
    if (!Number.isInteger(lineNumber) || lineNumber < 0) {
        throw new RangeError('lineNumber must be a non-negative integer');
    }
    let quote: '"' | "'" | null = null;
    let delimiterAt = -1;
    let commentAt = -1;
    for (let index = 0; index < text.length; index++) {
        const current = text[index];
        if (quote !== null) {
            if (current === quote) {
                if (text[index + 1] === quote) {
                    index++; // doubled quotes
                } else {
                    quote = null;
                }
            }
            continue;
        }
        // Quoted operands begin at a token boundary; an apostrophe inside an
        // unquoted path (for example O'Brien) is part of the path, not a quote.
        const atValueBoundary = index === 0 || /[\s=,(|]/.test(text[index - 1]);
        if ((current === '"' || current === "'") && atValueBoundary) {
            quote = current;
        } else if (current === '!' || current === '#') {
            commentAt = index;
            break;
        } else if (current === '=' && text[index + 1] === '=' && delimiterAt === -1) {
            delimiterAt = index;
            index++;
        }
    }
    const contentEnd = commentAt >= 0 ? commentAt : text.length;
    const leftHand = trimmedSegment(text, lineNumber, 0, delimiterAt >= 0 ? delimiterAt : contentEnd);
    const delimiter = delimiterAt >= 0 ? segment(text, lineNumber, delimiterAt, delimiterAt + 2) : null;
    const value = delimiterAt >= 0
        ? trimmedSegment(text, lineNumber, delimiterAt + 2, contentEnd) : null;
    const comment = commentAt >= 0 ? segment(text, lineNumber, commentAt, text.length) : null;
    const kind: ParsedTuflowLine['kind'] = delimiter
        ? (leftHand ? 'assignment' : 'incomplete')
        : (leftHand ? 'incomplete' : (comment ? 'comment' : 'empty'));
    return { lineNumber, leftHand, delimiter, value, comment, kind };
}

/** Exact phrase normalization, tolerant of case, whitespace and parentheses. */
export function normalizeCommandName(phrase: string): string {
    return phrase.trim().replace(/\s+/g, ' ')
        .replace(/\s*\(\s*/g, ' (')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*\)\s*/g, ') ')
        .trim().toLowerCase();
}
