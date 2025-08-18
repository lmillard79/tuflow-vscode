"use strict";
/**
 * TCF Commands (Appendix A)
 * TUFLOW Control File commands for simulation setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tcfCommands = void 0;
exports.tcfCommands = [
    {
        name: 'Read GIS',
        description: 'Reads GIS layers for the simulation domain',
        category: 'TCF',
        parameters: ['Layer Type', 'File Path', 'Optional Parameters'],
        syntax: 'Read GIS [Layer Type] == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Z Shape == model\\dem.shp',
            'Read GIS Material == model\\materials.shp',
            'Read GIS BC == model\\boundaries.shp'
        ],
        notes: 'Multiple GIS layers can be read in sequence'
    },
    {
        name: 'Write GIS',
        description: 'Writes GIS output layers',
        category: 'TCF',
        parameters: ['Output Type', 'File Path', 'Optional Parameters'],
        syntax: 'Write GIS [Output Type] == [File Path] [Optional Parameters]',
        examples: [
            'Write GIS Water Level == results\\wl.shp',
            'Write GIS Velocity == results\\vel.shp',
            'Write GIS Depth == results\\depth.shp'
        ]
    },
    {
        name: 'Cell Size',
        description: 'Defines the computational cell size for the simulation',
        category: 'TCF',
        parameters: ['Size Value'],
        syntax: 'Cell Size == [Value]',
        examples: ['Cell Size == 10', 'Cell Size == 5.5'],
        notes: 'Units must be consistent with coordinate system'
    },
    {
        name: 'Set Code',
        description: 'Sets the computational code version',
        category: 'TCF',
        parameters: ['Code Version'],
        syntax: 'Set Code == [Version]',
        examples: ['Set Code == Classic', 'Set Code == HPC'],
        notes: 'Determines which computational engine to use'
    },
    {
        name: 'Start Time',
        description: 'Sets the simulation start time',
        category: 'TCF',
        parameters: ['Time Value'],
        syntax: 'Start Time == [HH:MM:SS]',
        examples: ['Start Time == 00:00:00', 'Start Time == 01:30:00']
    },
    {
        name: 'End Time',
        description: 'Sets the simulation end time',
        category: 'TCF',
        parameters: ['Time Value'],
        syntax: 'End Time == [HH:MM:SS]',
        examples: ['End Time == 12:00:00', 'End Time == 48:00:00']
    },
    {
        name: 'Timestep',
        description: 'Sets the computational time step',
        category: 'TCF',
        parameters: ['Time Value'],
        syntax: 'Timestep == [Seconds]',
        examples: ['Timestep == 1', 'Timestep == 0.5'],
        notes: 'Adaptive timestep may override this value'
    },
    {
        name: 'Output Interval',
        description: 'Sets the frequency of output files',
        category: 'TCF',
        parameters: ['Time Value'],
        syntax: 'Output Interval == [Seconds]',
        examples: ['Output Interval == 300', 'Output Interval == 900']
    },
    {
        name: 'Map Output Interval',
        description: 'Sets the frequency of map output files',
        category: 'TCF',
        parameters: ['Time Value'],
        syntax: 'Map Output Interval == [Seconds]',
        examples: ['Map Output Interval == 900', 'Map Output Interval == 3600']
    },
    {
        name: 'Write Check Files',
        description: 'Controls the generation of check files',
        category: 'TCF',
        parameters: ['Check Type', 'Optional Parameters'],
        syntax: 'Write Check Files == [Type] [Parameters]',
        examples: [
            'Write Check Files == All',
            'Write Check Files == None',
            'Write Check Files == Zpt Check'
        ]
    },
    {
        name: 'Write Results',
        description: 'Controls the generation of result files',
        category: 'TCF',
        parameters: ['Result Type', 'Optional Parameters'],
        syntax: 'Write Results == [Type] [Parameters]',
        examples: [
            'Write Results == All',
            'Write Results == Water Level',
            'Write Results == Velocity Depth'
        ]
    },
    {
        name: 'BC Event',
        description: 'Defines boundary condition events',
        category: 'TCF',
        parameters: ['Event Name', 'Event Type', 'Parameters'],
        syntax: 'BC Event == [Name] [Type] [Parameters]',
        examples: [
            'BC Event == Rain1 Rainfall ~\\rainfall.csv',
            'BC Event == Tide1 Tide ~\\tide.csv'
        ]
    },
    {
        name: 'BC Database',
        description: 'Defines boundary condition database connections',
        category: 'TCF',
        parameters: ['Database Type', 'File Path'],
        syntax: 'BC Database == [Type] [File Path]',
        examples: [
            'BC Database == TMF ~\\bc_database.tmf',
            'BC Database == TBC ~\\bc_database.tbc'
        ]
    },
    {
        name: 'Define Source',
        description: 'Defines flow sources in the simulation',
        category: 'TCF',
        parameters: ['Source Name', 'Parameters'],
        syntax: 'Define Source == [Name] [Parameters]',
        examples: [
            'Define Source == Inflow1 Q 100',
            'Define Source == Outflow1 Q -50'
        ]
    },
    {
        name: 'Set IWL',
        description: 'Sets initial water level conditions',
        category: 'TCF',
        parameters: ['Water Level Value'],
        syntax: 'Set IWL == [Value]',
        examples: ['Set IWL == 10', 'Set IWL == Auto'],
        notes: 'Can use Auto for automatic initial water level'
    },
    {
        name: 'Set IWC',
        description: 'Sets initial water conditions',
        category: 'TCF',
        parameters: ['Condition Type', 'Parameters'],
        syntax: 'Set IWC == [Type] [Parameters]',
        examples: ['Set IWC == Dry', 'Set IWC == Wet 1.5']
    },
    {
        name: 'Set Mat',
        description: 'Defines material properties',
        category: 'TCF',
        parameters: ['Material ID', 'Parameters'],
        syntax: 'Set Mat == [ID] [Parameters]',
        examples: [
            'Set Mat == 1 Manning 0.03',
            'Set Mat == 2 HW 0.1'
        ]
    },
    {
        name: 'Set 2D Domain',
        description: 'Defines 2D simulation domain properties',
        category: 'TCF',
        parameters: ['Parameters'],
        syntax: 'Set 2D Domain == [Parameters]',
        examples: [
            'Set 2D Domain == Lower Left 0 0',
            'Set 2D Domain == Upper Right 1000 1000'
        ]
    },
    {
        name: 'Set 1D Domain',
        description: 'Defines 1D simulation domain properties',
        category: 'TCF',
        parameters: ['Parameters'],
        syntax: 'Set 1D Domain == [Parameters]',
        examples: [
            'Set 1D Domain == Network ~\\network.tin',
            'Set 1D Domain == Channels ~\\channels.tin'
        ]
    }
];
//# sourceMappingURL=tcfCommands.js.map