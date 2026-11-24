/**
 * Official TUFLOW Classic/HPC documentation links.
 *
 * Pin to an audited manual edition so that hyperlinks do not silently start
 * pointing at renamed pages in a later publication. There is deliberately no
 * TUFLOW version selector or dependency on local TUFLOW installations.
 */
export const officialManualUrl = 'https://docs.tuflow.com/classic-hpc/manual/2026.3/';

const appendixPages: Readonly<Record<string, string>> = {
    '.tcf': '80-AppendicesA-TCFCommands.html',
    '.ecf': '81-AppendicesB-ECFCommands.html',
    '.tgc': '82-AppendicesC-TGCCommands.html',
    '.tbc': '83-AppendicesD-TBCCommands.html',
    '.toc': '84-AppendicesE-TOCCommands.html',
    '.trfc': '85-AppendicesF-TRFCCommands.html',
    '.tesf': '86-AppendicesG-TESFCommands.html',
    '.qcf': '87-AppendicesH-QCFCommands.html',
    '.tscf': '88-AppendicesI-TSCFCommands.html',
    '.adcf': '89-AppendicesJ-ADCFCommands.html',
    '.tef': '90-AppendicesK-TEFCommands.html'
};

/**
 * Only commands checked against the official manual are individually linked.
 * Other catalogue entries are being reviewed separately in issues #3-#5.
 * The full appendix is used instead of constructing unverified URL fragments.
 */
const auditedCommands: Readonly<Record<string, readonly string[]>> = {
    '.tcf': ['BC Control File', 'Geometry Control File', 'End Time', 'Event File'],
    '.ecf': ['Read GIS Network'],
    '.tgc': ['Cell Size', 'Read GIS Z Shape'],
    '.tbc': ['BC Database'],
    '.trfc': ['RF Interpolation Method'],
    '.qcf': ['Base Cell Size'],
    '.tef': ['Define Event', 'End Define']
};

function normalizeExtension(extension: string): string {
    return extension.trim().toLowerCase();
}

function normalizeCommand(command: string): string {
    return command.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Return the authoritative appendix for this control-file extension. */
export function getDocumentationUrlForExtension(extension: string): string {
    const page = appendixPages[normalizeExtension(extension)];
    return page ? officialManualUrl + page : officialManualUrl;
}

/**
 * Link only audited commands. Return undefined rather than claiming unknown
 * commands have verified documentation entries.
 */
export function getAuditedCommandDocumentationUrl(extension: string, commandName: string): string | undefined {
    const normalizedExtension = normalizeExtension(extension);
    const hasAuditedCommand = (category: string): boolean =>
        (auditedCommands[category] || []).some(name => normalizeCommand(name) === normalizeCommand(commandName));
    if (hasAuditedCommand(normalizedExtension)) {
        return getDocumentationUrlForExtension(normalizedExtension);
    }
    // TEF event blocks also accept TCF and ECF commands; use their defining
    // appendix for an audited inherited command, not Appendix K.
    if (normalizedExtension === '.tef') {
        for (const category of ['.tcf', '.ecf']) {
            if (hasAuditedCommand(category)) {
                return getDocumentationUrlForExtension(category);
            }
        }
    }
    return undefined;
}

/**
 * Look up an audited command on the current editor line, or fall back to the
 * appendix for that file type. Do not infer any command from an inline comment.
 */
export function getDocumentationUrlForLine(extension: string, line: string): string {
    const commandLine = line.split(/[!#]/, 1)[0].trim();
    const separator = commandLine.indexOf('==');
    const commandName = separator >= 0 ? commandLine.slice(0, separator) : commandLine;
    return getAuditedCommandDocumentationUrl(extension, commandName)
        || getDocumentationUrlForExtension(extension);
}
