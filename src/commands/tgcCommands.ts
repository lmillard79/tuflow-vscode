/**
 * TGC Commands (Appendix C)
 * TUFLOW Geometry Control commands for geometry setup
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

export const tgcCommands: TuflowCommand[] = [
    {
        name: 'Read GIS Z Shape',
        description: 'Reads GIS elevation data for terrain modeling',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Z Shape == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Z Shape == dem\\dem.tif',
            'Read GIS Z Shape == dem\\dem.shp Z 0.1',
            'Read GIS Z Shape == dem\\dem.asc Z 1.0'
        ],
        notes: 'Supports multiple raster and vector formats'
    },
    {
        name: 'Read GIS Z Line',
        description: 'Reads GIS line data for elevation features',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Z Line == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Z Line == levees\\levees.shp Z 2.0',
            'Read GIS Z Line == roads\\roads.shp Z 0.5'
        ]
    },
    {
        name: 'Read GIS Z Point',
        description: 'Reads GIS point data for elevation points',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Z Point == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Z Point == points\\elev_points.shp Z 10.0',
            'Read GIS Z Point == survey\\survey_points.shp Z 5.5'
        ]
    },
    {
        name: 'Read GIS Mat',
        description: 'Reads GIS material assignments',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Mat == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Mat == materials\\materials.shp',
            'Read GIS Mat == landuse\\landuse.shp Mat 1'
        ]
    },
    {
        name: 'Read GIS BC',
        description: 'Reads GIS boundary condition locations',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS BC == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS BC == boundaries\\inflow.shp',
            'Read GIS BC == boundaries\\outflow.shp',
            'Read GIS BC == boundaries\\walls.shp'
        ]
    },
    {
        name: 'Read GIS HX',
        description: 'Reads GIS HX (1D/2D link) locations',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS HX == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS HX == links\\hx_links.shp',
            'Read GIS HX == connections\\hx_connections.shp'
        ]
    },
    {
        name: 'Read GIS SX',
        description: 'Reads GIS SX (storage link) locations',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS SX == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS SX == storage\\sx_links.shp',
            'Read GIS SX == connections\\sx_connections.shp'
        ]
    },
    {
        name: 'Read GIS SA',
        description: 'Reads GIS storage area definitions',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS SA == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS SA == storage\\storage_areas.shp',
            'Read GIS SA == lakes\\lakes.shp'
        ]
    },
    {
        name: 'Read GIS Q',
        description: 'Reads GIS flow source locations',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Q == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Q == sources\\inflow_points.shp',
            'Read GIS Q == sources\\outflow_points.shp'
        ]
    },
    {
        name: 'Read GIS HT',
        description: 'Reads GIS head-time boundary locations',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS HT == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS HT == boundaries\\ht_points.shp',
            'Read GIS HT == boundaries\\level_points.shp'
        ]
    },
    {
        name: 'Read GIS WL',
        description: 'Reads GIS water level boundary locations',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS WL == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS WL == boundaries\\wl_points.shp',
            'Read GIS WL == boundaries\\level_boundaries.shp'
        ]
    },
    {
        name: 'Read GIS Node',
        description: 'Reads GIS node locations for 1D networks',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Node == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Node == network\\nodes.shp',
            'Read GIS Node == network\\junctions.shp'
        ]
    },
    {
        name: 'Read GIS Channel',
        description: 'Reads GIS channel network definitions',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Channel == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Channel == network\\channels.shp',
            'Read GIS Channel == network\\streams.shp'
        ]
    },
    {
        name: 'Read GIS Pipe',
        description: 'Reads GIS pipe network definitions',
        category: 'TGC',
        parameters: ['File Path', 'Optional Parameters'],
        syntax: 'Read GIS Pipe == [File Path] [Optional Parameters]',
        examples: [
            'Read GIS Pipe == network\\pipes.shp',
            'Read GIS Pipe == network\\sewers.shp'
        ]
    },
    {
        name: 'Set Z Grid',
        description: 'Defines elevation grid properties',
        category: 'TGC',
        parameters: ['Parameters'],
        syntax: 'Set Z Grid == [Parameters]',
        examples: [
            'Set Z Grid == 0.1',
            'Set Z Grid == 1.0'
        ]
    },
    {
        name: 'Set Z Shape',
        description: 'Defines elevation shape properties',
        category: 'TGC',
        parameters: ['Parameters'],
        syntax: 'Set Z Shape == [Parameters]',
        examples: [
            'Set Z Shape == 0.1',
            'Set Z Shape == 1.0'
        ]
    },
    {
        name: 'Set Z Line',
        description: 'Defines elevation line properties',
        category: 'TGC',
        parameters: ['Parameters'],
        syntax: 'Set Z Line == [Parameters]',
        examples: [
            'Set Z Line == 0.1',
            'Set Z Line == 1.0'
        ]
    },
    {
        name: 'Set Z Point',
        description: 'Defines elevation point properties',
        category: 'TGC',
        parameters: ['Parameters'],
        syntax: 'Set Z Point == [Parameters]',
        examples: [
            'Set Z Point == 0.1',
            'Set Z Point == 1.0'
        ]
    },
    {
        name: 'Set Mat',
        description: 'Defines material properties in geometry',
        category: 'TGC',
        parameters: ['Material ID', 'Parameters'],
        syntax: 'Set Mat == [ID] [Parameters]',
        examples: [
            'Set Mat == 1 Manning 0.03',
            'Set Mat == 2 HW 0.1',
            'Set Mat == 3 Infiltration 0.001'
        ]
    },
    {
        name: 'Set BC',
        description: 'Defines boundary condition properties',
        category: 'TGC',
        parameters: ['BC ID', 'Parameters'],
        syntax: 'Set BC == [ID] [Parameters]',
        examples: [
            'Set BC == 1 Type Inflow',
            'Set BC == 2 Type Outflow',
            'Set BC == 3 Type Wall'
        ]
    },
    {
        name: 'Set HX',
        description: 'Defines HX (1D/2D link) properties',
        category: 'TGC',
        parameters: ['HX ID', 'Parameters'],
        syntax: 'Set HX == [ID] [Parameters]',
        examples: [
            'Set HX == 1 Type Channel',
            'Set HX == 2 Type Pipe',
            'Set HX == 3 Coefficient 0.8'
        ]
    },
    {
        name: 'Set SX',
        description: 'Defines SX (storage link) properties',
        category: 'TGC',
        parameters: ['SX ID', 'Parameters'],
        syntax: 'Set SX == [ID] [Parameters]',
        examples: [
            'Set SX == 1 Type Storage',
            'Set SX == 2 Coefficient 0.5',
            'Set SX == 3 Area 1000'
        ]
    },
    {
        name: 'Set SA',
        description: 'Defines storage area properties',
        category: 'TGC',
        parameters: ['SA ID', 'Parameters'],
        syntax: 'Set SA == [ID] [Parameters]',
        examples: [
            'Set SA == 1 Area 1000',
            'Set SA == 2 Volume 5000',
            'Set SA == 3 Level 10'
        ]
    },
    {
        name: 'Set Q',
        description: 'Defines flow source properties',
        category: 'TGC',
        parameters: ['Q ID', 'Parameters'],
        syntax: 'Set Q == [ID] [Parameters]',
        examples: [
            'Set Q == 1 Type Inflow',
            'Set Q == 2 Type Outflow',
            'Set Q == 3 Coefficient 1.0'
        ]
    },
    {
        name: 'Set HT',
        description: 'Defines head-time boundary properties',
        category: 'TGC',
        parameters: ['HT ID', 'Parameters'],
        syntax: 'Set HT == [ID] [Parameters]',
        examples: [
            'Set HT == 1 Type Level',
            'Set HT == 2 Level 10',
            'Set HT == 3 Database ~\\levels.csv'
        ]
    },
    {
        name: 'Set WL',
        description: 'Defines water level boundary properties',
        category: 'TGC',
        parameters: ['WL ID', 'Parameters'],
        syntax: 'Set WL == [ID] [Parameters]',
        examples: [
            'Set WL == 1 Type Level',
            'Set WL == 2 Level 5',
            'Set WL == 3 Database ~\\wl.csv'
        ]
    },
    {
        name: 'Set Node',
        description: 'Defines node properties for 1D networks',
        category: 'TGC',
        parameters: ['Node ID', 'Parameters'],
        syntax: 'Set Node == [ID] [Parameters]',
        examples: [
            'Set Node == 1 Type Junction',
            'Set Node == 2 Level 10',
            'Set Node == 3 Storage 1000'
        ]
    },
    {
        name: 'Set Channel',
        description: 'Defines channel properties',
        category: 'TGC',
        parameters: ['Channel ID', 'Parameters'],
        syntax: 'Set Channel == [ID] [Parameters]',
        examples: [
            'Set Channel == 1 Width 5',
            'Set Channel == 2 Slope 0.001',
            'Set Channel == 3 Manning 0.03'
        ]
    },
    {
        name: 'Set Pipe',
        description: 'Defines pipe properties',
        category: 'TGC',
        parameters: ['Pipe ID', 'Parameters'],
        syntax: 'Set Pipe == [ID] [Parameters]',
        examples: [
            'Set Pipe == 1 Diameter 1.5',
            'Set Pipe == 2 Manning 0.013',
            'Set Pipe == 3 Slope 0.001'
        ]
    },
    {
        name: 'Set Grid',
        description: 'Defines computational grid properties',
        category: 'TGC',
        parameters: ['Parameters'],
        syntax: 'Set Grid == [Parameters]',
        examples: [
            'Set Grid == 10',
            'Set Grid == 5.5',
            'Set Grid == Regular'
        ]
    },
    {
        name: 'Set Origin',
        description: 'Defines coordinate origin for geometry',
        category: 'TGC',
        parameters: ['X Y Coordinates'],
        syntax: 'Set Origin == [X] [Y]',
        examples: [
            'Set Origin == 0 0',
            'Set Origin == 500000 5000000'
        ]
    },
    {
        name: 'Set Extent',
        description: 'Defines domain extent',
        category: 'TGC',
        parameters: ['Lower Left X Y Upper Right X Y'],
        syntax: 'Set Extent == [LLX] [LLY] [URX] [URY]',
        examples: [
            'Set Extent == 0 0 1000 1000',
            'Set Extent == 500000 5000000 501000 5001000'
        ]
    }
];
