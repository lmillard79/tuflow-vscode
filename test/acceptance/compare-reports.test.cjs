'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

test('CPU comparisons are per-call and flag different sample configurations', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-accept-compare-'));
  try {
    function report(samples) {
      return {
        schemaVersion: 1, profile: 'combined',
        phase: samples === 12 ? 'baseline' : 'post-change',
        revision: samples === 12 ? 'base-sha' : 'head-sha',
        startedAt: '2026-11-22T00:00:00Z',
        environment: {
          platform: 'linux', arch: 'x64', vscodeVersion: '1.147.0',
          cpuModel: 'Same CPU', logicalCpus: 8, machineMemoryBytes: 1e9,
          configuredRepeats: String(samples), configuredSyntheticLines: '10000'
        },
        extensions: {},
        metrics: {
          rootFirstOpen: {openAndShowMs: samples === 12 ? 10 : 20,
            alreadyOpenBeforeMeasurement: false},
          documentOpen: {'model.tcf': {openAndShowMs: 1}},
          completion: {samples, p50Ms: 10, p95Ms: 15,
            cpuUserMs: samples, cpuSystemMs: samples / 2}
        },
        summary: {pass: 1, fail: 0, blocked: 0, unverified: 1}
      };
    }
    const before = path.join(dir, 'before.json');
    const after = path.join(dir, 'after.json');
    fs.writeFileSync(before, JSON.stringify(report(12)));
    fs.writeFileSync(after, JSON.stringify(report(24)));
    const result = spawnSync(process.execPath,
      [path.join(__dirname, 'compare-reports.mjs'), before, after],
      {encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Environment differences: configuredRepeats/);
    assert.match(result.stdout, /completion sample count \| 12 \| 24 \| workload shown/);
    assert.match(result.stdout, /root first open\/show \| 10\.00 ms \| 20\.00 ms \| 100\.0%/);
    assert.match(result.stdout, /root subsequent open\/show \| 1\.00 ms \| 1\.00 ms \| 0\.0%/);
    assert.match(result.stdout, /already editor-open before first measured operation: baseline=false, after=false/);
    assert.match(result.stdout,
      /completion cpuUserMs\/call \| 1\.00 ms\/call \| 1\.00 ms\/call \| 0\.0%/);
    assert.match(result.stdout,
      /completion cpuSystemMs\/call \| 0\.50 ms\/call \| 0\.50 ms\/call \| 0\.0%/);
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});
