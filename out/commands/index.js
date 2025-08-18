"use strict";
/**
 * TUFLOW Commands Index
 * Central export for all TUFLOW command definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileTypeCommands = exports.commandCategories = exports.searchCommands = exports.getCommandsByName = exports.getCommandsByCategory = exports.tbcCommands = exports.tgcCommands = exports.tcfCommands = exports.allTuflowCommands = void 0;
const tcfCommands_1 = require("./tcfCommands");
Object.defineProperty(exports, "tcfCommands", { enumerable: true, get: function () { return tcfCommands_1.tcfCommands; } });
const tgcCommands_1 = require("./tgcCommands");
Object.defineProperty(exports, "tgcCommands", { enumerable: true, get: function () { return tgcCommands_1.tgcCommands; } });
const tbcCommands_1 = require("./tbcCommands");
Object.defineProperty(exports, "tbcCommands", { enumerable: true, get: function () { return tbcCommands_1.tbcCommands; } });
// Combine all commands into a single array
exports.allTuflowCommands = [
    ...tcfCommands_1.tcfCommands,
    ...tgcCommands_1.tgcCommands,
    ...tbcCommands_1.tbcCommands
];
// Helper functions for command retrieval
function getCommandsByCategory(category) {
    return exports.allTuflowCommands.filter(cmd => cmd.category === category);
}
exports.getCommandsByCategory = getCommandsByCategory;
function getCommandsByName(name) {
    return exports.allTuflowCommands.find(cmd => cmd.name.toLowerCase() === name.toLowerCase());
}
exports.getCommandsByName = getCommandsByName;
function searchCommands(query) {
    const lowerQuery = query.toLowerCase();
    return exports.allTuflowCommands.filter(cmd => cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery));
}
exports.searchCommands = searchCommands;
// Command categories for filtering
exports.commandCategories = {
    TCF: 'TCF Commands (TUFLOW Control File)',
    TGC: 'TGC Commands (TUFLOW Geometry Control)',
    TBC: 'TBC Commands (TUFLOW Boundary Conditions)'
};
// File type associations
exports.fileTypeCommands = {
    '.tcf': tcfCommands_1.tcfCommands,
    '.tgc': tgcCommands_1.tgcCommands,
    '.tbc': tbcCommands_1.tbcCommands
};
//# sourceMappingURL=index.js.map