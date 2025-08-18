/**
 * TUFLOW Commands Index
 * Central export for all TUFLOW command definitions
 */

import { tcfCommands } from './tcfCommands';
import { tgcCommands } from './tgcCommands';
import { tbcCommands } from './tbcCommands';

export interface TuflowCommand {
    name: string;
    description: string;
    category: string;
    parameters?: string[];
    examples?: string[];
    syntax?: string;
    notes?: string;
}

// Combine all commands into a single array
export const allTuflowCommands: TuflowCommand[] = [
    ...tcfCommands,
    ...tgcCommands,
    ...tbcCommands
];

// Export individual command arrays
export { tcfCommands, tgcCommands, tbcCommands };

// Helper functions for command retrieval
export function getCommandsByCategory(category: string): TuflowCommand[] {
    return allTuflowCommands.filter(cmd => cmd.category === category);
}

export function getCommandsByName(name: string): TuflowCommand | undefined {
    return allTuflowCommands.find(cmd => cmd.name.toLowerCase() === name.toLowerCase());
}

export function searchCommands(query: string): TuflowCommand[] {
    const lowerQuery = query.toLowerCase();
    return allTuflowCommands.filter(cmd => 
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery)
    );
}

// Command categories for filtering
export const commandCategories = {
    TCF: 'TCF Commands (TUFLOW Control File)',
    TGC: 'TGC Commands (TUFLOW Geometry Control)',
    TBC: 'TBC Commands (TUFLOW Boundary Conditions)'
};

// File type associations
export const fileTypeCommands = {
    '.tcf': tcfCommands,
    '.tgc': tgcCommands,
    '.tbc': tbcCommands
};
