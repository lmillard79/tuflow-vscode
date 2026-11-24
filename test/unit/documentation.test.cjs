'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
    officialManualUrl,
    getDocumentationUrlForExtension,
    getAuditedCommandDocumentationUrl,
    getDocumentationUrlForLine
} = require('../../out/documentation.js');

const expectedAppendices = {
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

test('every mapped control file opens a pinned official appendix', () => {
    assert.match(officialManualUrl, /^https:\/\/docs\.tuflow\.com\/classic-hpc\/manual\/2026\.3\/$/);
    for (const [extension, page] of Object.entries(expectedAppendices)) {
        assert.equal(getDocumentationUrlForExtension(extension), officialManualUrl + page);
        assert.equal(getDocumentationUrlForExtension(extension.toUpperCase()), officialManualUrl + page);
    }
});

test('unsupported types and no editor use official index rather than local HTML', () => {
    assert.equal(getDocumentationUrlForExtension(''), officialManualUrl);
    assert.equal(getDocumentationUrlForExtension('.fvc'), officialManualUrl);
    assert.equal(getDocumentationUrlForExtension('.xyz'), officialManualUrl);
});

test('audited commands have official references without guessed fragments', () => {
    assert.equal(getAuditedCommandDocumentationUrl('.tcf', 'Geometry Control File'), getDocumentationUrlForExtension('.tcf'));
    assert.equal(getAuditedCommandDocumentationUrl('.tgc', '  read   GIS  z  shape  '), getDocumentationUrlForExtension('.tgc'));
    assert.equal(getAuditedCommandDocumentationUrl('.tef', 'End Define'), getDocumentationUrlForExtension('.tef'));
    assert.equal(getAuditedCommandDocumentationUrl('.tef', 'End Time'), getDocumentationUrlForExtension('.tcf'));
    assert.equal(getAuditedCommandDocumentationUrl('.tgc', 'Unverified Command'), undefined);
    assert.equal(getAuditedCommandDocumentationUrl('.tcf', 'Cell Size'), undefined);
    assert.equal(getAuditedCommandDocumentationUrl('.ecf', 'Geometry Control File'), undefined);
});

test('help action resolves a command with whitespace and comments', () => {
    assert.equal(getDocumentationUrlForLine('.tgc', ' Read GIS Z Shape == input.shp ! comment'), getDocumentationUrlForExtension('.tgc'));
    assert.equal(getDocumentationUrlForLine('.tef', '  End Define  '), getDocumentationUrlForExtension('.tef'));
    assert.equal(getDocumentationUrlForLine('.tef', '  End Time == 12  '), getDocumentationUrlForExtension('.tcf'));
    assert.equal(getDocumentationUrlForLine('.qcf', '  Base Cell Size == 20  # comment'), getDocumentationUrlForExtension('.qcf'));
    assert.equal(getDocumentationUrlForLine('.tcf', '! End Time == 20'), getDocumentationUrlForExtension('.tcf'));
});
