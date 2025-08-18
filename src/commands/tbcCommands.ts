/**
 * TBC Commands (Appendix D)
 * TUFLOW Boundary Condition commands for boundary setup
 */

export interface TuflowCommand {
    name: string;
    description: string;
    category: string;
    parameters?: string[];
    examples?: string[];
    syntax?: string;
    notes?: string;
}

export const tbcCommands: TuflowCommand[] = [
    {
        name: 'Define Event',
        description: 'Defines boundary condition events',
        category: 'TBC',
        parameters: ['Event Name', 'Event Type', 'Parameters'],
        syntax: 'Define Event == [Name] [Type] [Parameters]',
        examples: [
            'Define Event == Rain1 Rainfall ~\\rainfall.csv',
            'Define Event == Tide1 Tide ~\\tide.csv',
            'Define Event == Inflow1 Flow 100'
        ],
        notes: 'Events can be referenced by name in boundary definitions'
    },
    {
        name: 'Define Source',
        description: 'Defines flow sources and sinks',
        category: 'TBC',
        parameters: ['Source Name', 'Source Type', 'Parameters'],
        syntax: 'Define Source == [Name] [Type] [Parameters]',
        examples: [
            'Define Source == Inflow1 Q 100',
            'Define Source == Outflow1 Q -50',
            'Define Source == Rain1 RF ~\\rain.csv'
        ]
    },
    {
        name: 'Define BC',
        description: 'Defines boundary conditions',
        category: 'TBC',
        parameters: ['BC Name', 'BC Type', 'Parameters'],
        syntax: 'Define BC == [Name] [Type] [Parameters]',
        examples: [
            'Define BC == Inflow1 Q 100',
            'Define BC == Outflow1 Level 5',
            'Define BC == Wall1 Type Wall'
        ]
    },
    {
        name: 'Define HT',
        description: 'Defines head-time boundary conditions',
        category: 'TBC',
        parameters: ['HT Name', 'Parameters'],
        syntax: 'Define HT == [Name] [Parameters]',
        examples: [
            'Define HT == HT1 Level 10',
            'Define HT == HT2 Database ~\\levels.csv',
            'Define HT == HT3 Time Series ~\\ht.csv'
        ]
    },
    {
        name: 'Define WL',
        description: 'Defines water level boundary conditions',
        category: 'TBC',
        parameters: ['WL Name', 'Parameters'],
        syntax: 'Define WL == [Name] [Parameters]',
        examples: [
            'Define WL == WL1 Level 5',
            'Define WL == WL2 Database ~\\wl.csv',
            'Define WL == WL3 Time Series ~\\wl.csv'
        ]
    },
    {
        name: 'Define Q',
        description: 'Defines flow boundary conditions',
        category: 'TBC',
        parameters: ['Q Name', 'Parameters'],
        syntax: 'Define Q == [Name] [Parameters]',
        examples: [
            'Define Q == Q1 Flow 100',
            'Define Q == Q2 Database ~\\flow.csv',
            'Define Q == Q3 Time Series ~\\q.csv'
        ]
    },
    {
        name: 'Define RF',
        description: 'Defines rainfall boundary conditions',
        category: 'TBC',
        parameters: ['RF Name', 'Parameters'],
        syntax: 'Define RF == [Name] [Parameters]',
        examples: [
            'Define RF == RF1 Rain 50',
            'Define RF == RF2 Database ~\\rain.csv',
            'Define RF == RF3 Time Series ~\\rf.csv'
        ]
    },
    {
        name: 'Define Na',
        description: 'Defines normal flow boundary conditions',
        category: 'TBC',
        parameters: ['Na Name', 'Parameters'],
        syntax: 'Define Na == [Name] [Parameters]',
        examples: [
            'Define Na == Na1 Normal 0.001',
            'Define Na == Na2 Critical',
            'Define Na == Na3 Slope 0.001'
        ]
    },
    {
        name: 'Define QH',
        description: 'Defines flow-head boundary conditions',
        category: 'TBC',
        parameters: ['QH Name', 'Parameters'],
        syntax: 'Define QH == [Name] [Parameters]',
        examples: [
            'Define QH == QH1 Q100 H10',
            'Define QH == QH2 Database ~\\qh.csv',
            'Define QH == QH3 Time Series ~\\qh.csv'
        ]
    },
    {
        name: 'Set Database',
        description: 'Defines database connections for boundary data',
        category: 'TBC',
        parameters: ['Database Type', 'File Path'],
        syntax: 'Set Database == [Type] [File Path]',
        examples: [
            'Set Database == TMF ~\\bc_database.tmf',
            'Set Database == CSV ~\\boundary_data.csv',
            'Set Database == TBC ~\\boundary_conditions.tbc'
        ]
    },
    {
        name: 'Set Time Series',
        description: 'Defines time series data for boundary conditions',
        category: 'TBC',
        parameters: ['Time Series Name', 'File Path'],
        syntax: 'Set Time Series == [Name] [File Path]',
        examples: [
            'Set Time Series == Inflow ~\\inflow.csv',
            'Set Time Series == Tide ~\\tide.csv',
            'Set Time Series == Rain ~\\rainfall.csv'
        ]
    },
    {
        name: 'Set Rating',
        description: 'Defines rating curve data for boundary conditions',
        category: 'TBC',
        parameters: ['Rating Name', 'File Path'],
        syntax: 'Set Rating == [Name] [File Path]',
        examples: [
            'Set Rating == Outlet ~\\outlet_rating.csv',
            'Set Rating == Weir ~\\weir_rating.csv',
            'Set Rating == Culvert ~\\culvert_rating.csv'
        ]
    },
    {
        name: 'Set Boundary',
        description: 'Defines general boundary properties',
        category: 'TBC',
        parameters: ['Boundary Type', 'Parameters'],
        syntax: 'Set Boundary == [Type] [Parameters]',
        examples: [
            'Set Boundary == Inflow 100',
            'Set Boundary == Outflow Level 5',
            'Set Boundary == Wall Height 2.0'
        ]
    },
    {
        name: 'Set Inflow',
        description: 'Defines inflow boundary conditions',
        category: 'TBC',
        parameters: ['Inflow Name', 'Parameters'],
        syntax: 'Set Inflow == [Name] [Parameters]',
        examples: [
            'Set Inflow == In1 Flow 100',
            'Set Inflow == In2 Database ~\\inflow.csv',
            'Set Inflow == In3 Time Series ~\\inflow.csv'
        ]
    },
    {
        name: 'Set Outflow',
        description: 'Defines outflow boundary conditions',
        category: 'TBC',
        parameters: ['Outflow Name', 'Parameters'],
        syntax: 'Set Outflow == [Name] [Parameters]',
        examples: [
            'Set Outflow == Out1 Level 5',
            'Set Outflow == Out2 Database ~\\outflow.csv',
            'Set Outflow == Out3 Rating ~\\outlet_rating.csv'
        ]
    },
    {
        name: 'Set Wall',
        description: 'Defines wall boundary conditions',
        category: 'TBC',
        parameters: ['Wall Name', 'Parameters'],
        syntax: 'Set Wall == [Name] [Parameters]',
        examples: [
            'Set Wall == Wall1 Height 2.0',
            'Set Wall == Wall2 Crest 5.0',
            'Set Wall == Wall3 Weir Coeff 1.7'
        ]
    },
    {
        name: 'Set Weir',
        description: 'Defines weir boundary conditions',
        category: 'TBC',
        parameters: ['Weir Name', 'Parameters'],
        syntax: 'Set Weir == [Name] [Parameters]',
        examples: [
            'Set Weir == Weir1 Crest 2.5',
            'Set Weir == Weir2 Coeff 1.7',
            'Set Weir == Weir3 Database ~\\weir_data.csv'
        ]
    },
    {
        name: 'Set Culvert',
        description: 'Defines culvert boundary conditions',
        category: 'TBC',
        parameters: ['Culvert Name', 'Parameters'],
        syntax: 'Set Culvert == [Name] [Parameters]',
        examples: [
            'Set Culvert == Culv1 Inlet 2.0',
            'Set Culvert == Culv2 Outlet 1.5',
            'Set Culvert == Culv3 Database ~\\culvert_data.csv'
        ]
    },
    {
        name: 'Set Bridge',
        description: 'Defines bridge boundary conditions',
        category: 'TBC',
        parameters: ['Bridge Name', 'Parameters'],
        syntax: 'Set Bridge == [Name] [Parameters]',
        examples: [
            'Set Bridge == Bridge1 Deck 5',
            'Set Bridge == Bridge2 Piers 3',
            'Set Bridge == Bridge3 Database ~\\bridge_data.csv'
        ]
    },
    {
        name: 'Set Pump',
        description: 'Defines pump boundary conditions',
        category: 'TBC',
        parameters: ['Pump Name', 'Parameters'],
        syntax: 'Set Pump == [Name] [Parameters]',
        examples: [
            'Set Pump == Pump1 Flow 50',
            'Set Pump == Pump2 Curve ~\\pump_curve.csv',
            'Set Pump == Pump3 Database ~\\pump_data.csv'
        ]
    },
    {
        name: 'Set Gate',
        description: 'Defines gate boundary conditions',
        category: 'TBC',
        parameters: ['Gate Name', 'Parameters'],
        syntax: 'Set Gate == [Name] [Parameters]',
        examples: [
            'Set Gate == Gate1 Height 2.0',
            'Set Gate == Gate2 Operation ~\\gate_op.csv',
            'Set Gate == Gate3 Database ~\\gate_data.csv'
        ]
    },
    {
        name: 'Set Orifice',
        description: 'Defines orifice boundary conditions',
        category: 'TBC',
        parameters: ['Orifice Name', 'Parameters'],
        syntax: 'Set Orifice == [Name] [Parameters]',
        examples: [
            'Set Orifice == Orif1 Area 1.0',
            'Set Orifice == Orif2 Coeff 0.6',
            'Set Orifice == Orif3 Database ~\\orifice_data.csv'
        ]
    },
    {
        name: 'Set Time',
        description: 'Defines time parameters for boundary conditions',
        category: 'TBC',
        parameters: ['Time Parameters'],
        syntax: 'Set Time == [Parameters]',
        examples: [
            'Set Time == Start 00:00:00',
            'Set Time == End 12:00:00',
            'Set Time == Interval 300'
        ]
    },
    {
        name: 'Set Units',
        description: 'Defines units for boundary condition data',
        category: 'TBC',
        parameters: ['Unit Parameters'],
        syntax: 'Set Units == [Parameters]',
        examples: [
            'Set Units == Flow CMS',
            'Set Units == Level M',
            'Set Units == Time Hours'
        ]
    },
    {
        name: 'Set Factor',
        description: 'Defines scaling factors for boundary data',
        category: 'TBC',
        parameters: ['Factor Parameters'],
        syntax: 'Set Factor == [Parameters]',
        examples: [
            'Set Factor == Flow 1.0',
            'Set Factor == Level 1.0',
            'Set Factor == Rain 1.2'
        ]
    },
    {
        name: 'Set Offset',
        description: 'Defines offset values for boundary data',
        category: 'TBC',
        parameters: ['Offset Parameters'],
        syntax: 'Set Offset == [Parameters]',
        examples: [
            'Set Offset == Flow 0',
            'Set Offset == Level 10',
            'Set Offset == Rain 0'
        ]
    },
    {
        name: 'Set Lag',
        description: 'Defines time lag for boundary data',
        category: 'TBC',
        parameters: ['Lag Parameters'],
        syntax: 'Set Lag == [Parameters]',
        examples: [
            'Set Lag == Flow 0',
            'Set Lag == Level 0',
            'Set Lag == Rain 3600'
        ]
    },
    {
        name: 'Set Interpolate',
        description: 'Defines interpolation method for boundary data',
        category: 'TBC',
        parameters: ['Interpolate Parameters'],
        syntax: 'Set Interpolate == [Parameters]',
        examples: [
            'Set Interpolate == Linear',
            'Set Interpolate == Spline',
            'Set Interpolate == Step'
        ]
    }
];
