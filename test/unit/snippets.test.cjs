'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const snippets = require('../../snippets/tuflow.json');

// Minimal default-tabstop expansion to regression-test the initial inserted text.
// The VS Code extension-host smoke checklist tests actual editor expansion.
function expandDefaults(body) {
    const text = Array.isArray(body) ? body.join('\n') : body;
    return text
        .replace(/\$\{\d+\|([^}]*)\|\}/g, (_, options) => options.split(',')[0])
        .replace(/\$\{\d+:([^}]*)\}/g, (_, value) => value);
}

const expected = {
    'tcf-geometry': 'Geometry Control File == ../model/model.tgc',
    'tcf-boundaries': 'BC Control File == ../model/model.tbc',
    'tcf-end-time': 'End Time == 12',
    'tgc-cell-size': 'Cell Size == 10',
    'tgc-z-shape': 'Read GIS Z Shape == ../model/gis/2d_zsh_001.shp',
    'tbc-database': 'BC Database == ../bc_dbase/bc_dbase.csv',
    'ecf-network': 'Read GIS Network == ../model/gis/1d_nwk_001.shp',
    'qcf-base-cell-size': 'Base Cell Size == 20',
    'trfc-interpolation': 'RF Interpolation Method == IDW',
    'tef-event': 'Define Event == design_event\n    End Time == 12\nEnd Define'
};

test('every snippet has a unique typed prefix and accurate expansion', () => {
    const prefixes = new Set();
    for (const [title, item] of Object.entries(snippets)) {
        assert.match(title, /^(TCF|TGC|TBC|ECF|QCF|TRFC|TEF): /);
        assert.match(item.description, /\(\.(tcf|tgc|tbc|ecf|qcf|trfc|tef)\)/);
        assert.ok(!prefixes.has(item.prefix), 'duplicate prefix: ' + item.prefix);
        prefixes.add(item.prefix);
        assert.equal(expandDefaults(item.body), expected[item.prefix], item.prefix);
    }
    assert.deepEqual([...prefixes].sort(), Object.keys(expected).sort());
});

test('snippets only contain supported VS Code placeholder forms', () => {
    for (const item of Object.values(snippets)) {
        const source = Array.isArray(item.body) ? item.body.join('\n') : item.body;
        const stripped = source.replace(/\$\{\d+(?::[^}]*)?\}/g, '').replace(/\$\{\d+\|[^}]*\|\}/g, '');
        assert.ok(!stripped.includes('$' + '{'), 'invalid placeholder in ' + item.prefix);
        assert.ok(!source.includes('Insert ordered list'), item.prefix);
    }
});
