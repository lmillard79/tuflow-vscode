import { TuflowCommand } from './index';

export const qcfCommands: TuflowCommand[] = [
	{
		name: 'Base Cell Size',
		description: 'Sets the Level 1 (parent) cell size for the quadtree mesh.',
		category: 'QCF',
		parameters: ['<cell_size>', 'TGC'],
		syntax: 'Base Cell Size == [ <cell_size> | {TGC} ]',
		examples: [
			'Base Cell Size == 10',
			'Base Cell Size == TGC'
		],
		notes: 'HPC. Using metric units (default) the value is in metres. Using Units == US Customary, the value is in feet. See Section 7.4.1 for more details.'
	},
	{
		name: 'Model Origin and Extent',
		description: 'Controls how the model origin and extent are defined.',
		category: 'QCF',
		parameters: ['Auto', 'TGC'],
		syntax: 'Model Origin and Extent == [ {Auto} | TGC ]',
		examples: [
			'Model Origin and Extent == Auto',
			'Model Origin and Extent == TGC'
		],
		notes: 'HPC. If set to "Auto" the GIS nesting polygons must have a Level 1 polygon defined, otherwise an ERROR is generated. The default setting is "TGC".'
	},
	{
		name: 'Orientation Angle',
		description: 'Sets the orientation angle of the quadtree mesh.',
		category: 'QCF',
		parameters: ['<angle>', 'Optimise', 'TGC'],
		syntax: 'Orientation Angle == [ <angle> | Optimise | {TGC} ]',
		examples: [
			'Orientation Angle == 0',
			'Orientation Angle == Optimise',
			'Orientation Angle == TGC'
		],
		notes: 'HPC'
	},
	{
		name: 'Quadtree Mesh Processing Method',
		description: 'Controls the method used for processing the quadtree mesh.',
		category: 'QCF',
		parameters: ['FAST', 'Memory Efficient'],
		syntax: 'Quadtree Mesh Processing Method == [ {FAST} | Memory Efficient ]',
		examples: [
			'Quadtree Mesh Processing Method == FAST',
			'Quadtree Mesh Processing Method == Memory Efficient'
		],
		notes: 'HPC'
	},
	{
		name: 'Read GIS Nesting',
		description: 'Reads a GIS layer containing nesting polygon data.',
		category: 'QCF',
		parameters: ['<gis_file_in_2d_qnl_format>'],
		syntax: 'Read GIS Nesting == [ <gis_file_in_2d_qnl_format> ]',
		examples: [
			'Read GIS Nesting == gis/nesting_polygons.shp'
		],
		notes: 'HPC'
	},
	{
		name: 'Spatial Database',
		description: 'Controls the spatial database functionality.',
		category: 'QCF',
		parameters: ['OFF', 'TCF'],
		syntax: 'Spatial Database == [ OFF | TCF ]',
		examples: [
			'Spatial Database == OFF',
			'Spatial Database == TCF'
		],
		notes: 'HPC'
	}
];
