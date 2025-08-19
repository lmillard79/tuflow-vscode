import { TuflowCommand } from './index';

export const trfcCommands: TuflowCommand[] = [
	{
		name: 'IDW Exponent',
		description: 'Changes the exponent in the IDW equation when using RF Interpolation Method == IDW.',
		category: 'TRFC',
		parameters: ['<p>', '2'],
		syntax: 'IDW Exponent == [ <p> | {2} ]',
		examples: [
			'IDW Exponent == 2',
			'IDW Exponent == 3'
		],
		notes: 'Classic and HPC. Refer to Section 8.5.3.6 for more details.'
	},
	{
		name: 'IDW Maximum Distance',
		description: 'Sets the maximum distance for a point to be considered in IDW interpolation.',
		category: 'TRFC',
		parameters: ['<max_dist>'],
		syntax: 'IDW Maximum Distance == [ <max_dist> ]',
		examples: [
			'IDW Maximum Distance == 1000'
		],
		notes: 'Classic and HPC. Using metric units (default), the distance is in metres. Using Units == US Customary, the units are feet. Refer to Section 8.5.3.6 for more details.'
	},
	{
		name: 'IDW Maximum Points',
		description: 'Sets the maximum number of points considered in IDW interpolation.',
		category: 'TRFC',
		parameters: ['<max_points>'],
		syntax: 'IDW Maximum Points == [ <max_points> ]',
		examples: [
			'IDW Maximum Points == 10'
		],
		notes: 'Classic and HPC. May reduce memory usage if a very large number of rainfall points are used. Refer to Section 8.5.3.6 for more details.'
	},
	{
		name: 'Maximum Hyetograph Points',
		description: 'Sets the maximum number of hyetograph points.',
		category: 'TRFC',
		parameters: ['<max_pts>', '1,000'],
		syntax: 'Maximum Hyetograph Points == [ <max_pts> | {1,000} ]',
		examples: [
			'Maximum Hyetograph Points == 1000',
			'Maximum Hyetograph Points == 5000'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Maximum RF Locations',
		description: 'Sets the maximum number of RF locations.',
		category: 'TRFC',
		parameters: ['<max_rf_gauges>', '1,000'],
		syntax: 'Maximum RF Locations == [ <max_rf_gauges> | {1,000} ]',
		examples: [
			'Maximum RF Locations == 1000',
			'Maximum RF Locations == 2000'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Read GIS RF Point',
		description: 'Reads a GIS layer containing rainfall point data.',
		category: 'TRFC',
		parameters: ['<gis_layer>'],
		syntax: 'Read GIS RF Point == [ <gis_layer> ]',
		examples: [
			'Read GIS RF Point == gis/rainfall_points.shp'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Read GIS RF Polygons',
		description: 'Reads a GIS layer containing rainfall polygon data.',
		category: 'TRFC',
		parameters: ['<gis_layer>'],
		syntax: 'Read GIS RF Polygons == [ <gis_layer> ]',
		examples: [
			'Read GIS RF Polygons == gis/rainfall_polygons.shp'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Read GIS RF Triangles',
		description: 'Reads a GIS layer containing rainfall triangle data.',
		category: 'TRFC',
		parameters: ['<gis_layer>'],
		syntax: 'Read GIS RF Triangles == [ <gis_layer> ]',
		examples: [
			'Read GIS RF Triangles == gis/rainfall_triangles.shp'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'RF Grid Cell Size',
		description: 'Sets the cell size for RF grid interpolation.',
		category: 'TRFC',
		parameters: ['<value>'],
		syntax: 'RF Grid Cell Size == [ <value> ]',
		examples: [
			'RF Grid Cell Size == 10'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'RF Grid Format',
		description: 'Specifies the format of RF grid files.',
		category: 'TRFC',
		parameters: ['ASC', 'FLT', 'NC', 'TIF'],
		syntax: 'RF Grid Format == [ ASC | FLT | NC | TIF ]',
		examples: [
			'RF Grid Format == ASC',
			'RF Grid Format == FLT',
			'RF Grid Format == NC',
			'RF Grid Format == TIF'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'RF Grid Origin',
		description: 'Sets the origin coordinates for RF grid interpolation.',
		category: 'TRFC',
		parameters: ['<OX>', '<OY>'],
		syntax: 'RF Grid Origin == [ <OX>, <OY> ]',
		examples: [
			'RF Grid Origin == 0, 0',
			'RF Grid Origin == 1000, 2000'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'RF Grid Size (N,M)',
		description: 'Sets the size of the RF grid in terms of rows and columns.',
		category: 'TRFC',
		parameters: ['<rows>', '<columns>'],
		syntax: 'RF Grid Size (N,M) == [ <rows>, <columns> ]',
		examples: [
			'RF Grid Size (N,M) == 100, 200'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'RF Grid Size (X,Y)',
		description: 'Sets the size of the RF grid in terms of X and Y dimensions.',
		category: 'TRFC',
		parameters: ['<X_length>', '<Y_length>'],
		syntax: 'RF Grid Size (X,Y) == [ <X_length>, <Y_length> ]',
		examples: [
			'RF Grid Size (X,Y) == 10000, 5000'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'RF Interpolation Method',
		description: 'Specifies the interpolation method used for rainfall data.',
		category: 'TRFC',
		parameters: ['IDW', 'POLYGON', 'TIN'],
		syntax: 'RF Interpolation Method == [ IDW | POLYGON | TIN ]',
		examples: [
			'RF Interpolation Method == IDW',
			'RF Interpolation Method == POLYGON',
			'RF Interpolation Method == TIN'
		],
		notes: 'Classic and HPC'
	}
];
