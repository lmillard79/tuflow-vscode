'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  expectedMissingPaths, childSummaryDiagnostics,
  leakedCommentCompletions, diagnosticCode, isFreshInvocationReport
} = require('./assertions.cjs');

const file = 'geometry.tgc';
const line = 5;
const missing = (path, changes = {}) => ({
  file, line, source: 'TUFLOW Path Validator', code: 'TPV001',
  message: 'File not found: ' + path, ...changes
});

test('exact TPV001 path assertion ignores unrelated parser errors', () => {
  const diagnostics = [{
    file, line, source: 'TUFLOW Command Parser', code: 'Syntax',
    message: 'Unexpected expression'
  }];
  assert.equal(expectedMissingPaths(diagnostics, file, line, ['gis/absent.shp']).pass, false);
  assert.equal(expectedMissingPaths(diagnostics, file, line, []).pass, true);
});

test('one path cannot satisfy a two-path expectation', () => {
  const single = [missing('gis/a.shp')];
  assert.equal(expectedMissingPaths(single, file, line, ['gis/a.shp', 'gis/b.shp']).pass, false);
  const both = [missing('gis/a.shp'), missing('gis/b.shp')];
  assert.equal(expectedMissingPaths(both, file, line, ['gis/a.shp', 'gis/b.shp']).pass, true);
  assert.equal(expectedMissingPaths([...both, missing('gis/a.shp')], file, line,
    ['gis/a.shp', 'gis/b.shp']).pass, false);
});

test('wrong source, diagnostic code or path never satisfies a missing-path check', () => {
  assert.equal(expectedMissingPaths([missing('gis/a.shp', {source: 'Other'})], file, line,
    ['gis/a.shp']).pass, false);
  assert.equal(expectedMissingPaths([missing('gis/a.shp', {code: 'TPV010'})], file, line,
    ['gis/a.shp']).pass, false);
  assert.equal(expectedMissingPaths([missing('gis/b.shp')], file, line,
    ['gis/a.shp']).pass, false);
  assert.equal(expectedMissingPaths([missing('gis/a.shp', {code: {value: 'TPV001'}})], file, line,
    ['gis/a.shp']).pass, true);
  assert.equal(diagnosticCode({code: null}), null);
});

test('no expected missing paths ignores unrelated diagnostics but rejects actual TPV001', () => {
  const unrelated = [{file, line, source: 'TUFLOW Path Validator', code: 'TPV010',
    message: 'End If expected'}];
  assert.equal(expectedMissingPaths(unrelated, file, line, []).pass, true);
  assert.equal(expectedMissingPaths([...unrelated, missing('gis/a.shp')], file, line, []).pass, false);
});

test('TPV002 summary identifies one exact child and excludes other sources', () => {
  const summary = {file: 'model.tcf', line: 6, source: 'TUFLOW Path Validator',
    code: 'TPV002', message: 'Referenced file has 2 issue(s): nested.trd'};
  const actual = childSummaryDiagnostics([summary], 'model.tcf', 6, 'nested.trd');
  assert.equal(actual.length, 1);
  assert.equal(childSummaryDiagnostics([summary], 'model.tcf', 6, 'other.trd').length, 0);
  assert.equal(childSummaryDiagnostics([{...summary, code: 'TPV010'}],
    'model.tcf', 6, 'nested.trd').length, 0);
});

test('inline comment fails for command completion even with no universal values', () => {
  const commands = new Set(['Read GIS Z Shape', 'Set Code']);
  const universal = new Set(['ALL', 'AUTO']);
  const keyword = 14;
  const fileKind = 16;
  assert.deepEqual(leakedCommentCompletions([
    {label: 'Read GIS Z Shape', kind: keyword},
    {label: 'Other editor suggestion', kind: 0}
  ], commands, universal, keyword, fileKind), ['Read GIS Z Shape']);
  assert.deepEqual(leakedCommentCompletions([
    {label: 'file path', kind: fileKind},
    {label: 'AUTO', kind: 12}
  ], commands, universal, keyword, fileKind), ['file path', 'AUTO']);
  assert.deepEqual(leakedCommentCompletions([
    {label: 'Unrelated editor suggestion', kind: 0}
  ], commands, universal, keyword, fileKind), []);
});


test('a stale or incomplete Host report never qualifies for known-failure exemption', () => {
  const report = {
    environment: {invocationId: 'current-run'},
    finishedAt: '2026-11-22T16:00:00Z',
    checks: [{id: 'multiword-command-hover', status: 'fail'}],
    summary: {pass: 0, fail: 1, blocked: 0, unverified: 0}
  };
  assert.equal(isFreshInvocationReport(report, 'current-run'), true);
  assert.equal(isFreshInvocationReport(report, 'previous-run'), false);
  assert.equal(isFreshInvocationReport({...report, environment: {}}, 'current-run'), false);
  assert.equal(isFreshInvocationReport({...report, finishedAt: undefined}, 'current-run'), false);
  assert.equal(isFreshInvocationReport({...report, checks: undefined}, 'current-run'), false);
  assert.equal(isFreshInvocationReport(null, 'current-run'), false);
});


test('editor word suggestions cannot be mistaken for Helper universal values', () => {
  const universal = new Set(['NO', 'AUTO']);
  assert.deepEqual(leakedCommentCompletions([
    {label: 'No', kind: 0}, {label: 'AUTO', kind: 0}
  ], new Set(), universal, 14, 16), []);
  assert.deepEqual(leakedCommentCompletions([
    {label: 'NO', kind: 12}
  ], new Set(), universal, 14, 16), ['NO']);
});
