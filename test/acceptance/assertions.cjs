'use strict';

// Pure acceptance assertions: do not import VS Code or touch the filesystem.
const VALIDATOR_SOURCE = 'TUFLOW Path Validator';
const MISSING_FILE_CODE = 'TPV001';
const MISSING_FILE_PREFIX = 'File not found: ';

function diagnosticCode(diagnostic) {
  const code = diagnostic.code;
  return code && typeof code === 'object' ? String(code.value) : code == null ? null : String(code);
}

function missingPathDiagnostics(diagnostics, file, line) {
  return diagnostics.filter(entry =>
    entry.file === file &&
    entry.line === line &&
    entry.source === VALIDATOR_SOURCE &&
    diagnosticCode(entry) === MISSING_FILE_CODE &&
    typeof entry.message === 'string' &&
    entry.message.startsWith(MISSING_FILE_PREFIX)
  );
}

function expectedMissingPaths(diagnostics, file, line, expectedPaths) {
  const actual = missingPathDiagnostics(diagnostics, file, line)
    .map(entry => entry.message.slice(MISSING_FILE_PREFIX.length)).sort();
  const expected = [...expectedPaths].sort();
  return {
    pass: actual.length === expected.length &&
      actual.every((value, i) => value === expected[i]),
    expected,
    actual,
    ignoredUnrelated: diagnostics.filter(entry =>
      entry.file === file && entry.line === line).length - actual.length
  };
}

function childSummaryDiagnostics(diagnostics, file, line, childName) {
  return diagnostics.filter(entry => {
    if (entry.file !== file || entry.line !== line ||
        entry.source !== VALIDATOR_SOURCE || diagnosticCode(entry) !== 'TPV002') return false;
    const match = /^Referenced file has ([1-9][0-9]*) issue\(s\): (.+)$/.exec(entry.message || '');
    return Boolean(match && match[2] === childName);
  });
}

function leakedCommentCompletions(items, commandLabels, universalLabels, keywordKind, fileKind) {
  const known = new Set([...commandLabels].map(label => String(label).toLowerCase()));
  return items.filter(item => {
    const label = typeof item.label === 'string' ? item.label : item.label?.label || '';
    const lower = label.toLowerCase();
    return (item.kind === 12 && universalLabels.has(label.toUpperCase())) ||
      (item.kind === keywordKind && known.has(lower)) ||
      (item.kind === fileKind && lower === 'file path');
  }).map(item => typeof item.label === 'string' ? item.label : item.label?.label || '');
}

function isFreshInvocationReport(report, invocationId) {
  return typeof invocationId === 'string' && invocationId.length > 0 &&
    Boolean(report && report.environment?.invocationId === invocationId &&
      typeof report.finishedAt === 'string' &&
      report.finishedAt.length > 0 &&
      Array.isArray(report.checks) && report.summary &&
      typeof report.summary.fail === 'number');
}

module.exports = {
  diagnosticCode, expectedMissingPaths, missingPathDiagnostics,
  childSummaryDiagnostics, leakedCommentCompletions, isFreshInvocationReport
};
