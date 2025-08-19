import { TuflowCommand } from './index';

export const ecfCommands: TuflowCommand[] = [
	{
		name: 'AD Approach',
		description: 'Controls the approach loss coefficient used in the 1D AD approach loss calculation.',
		category: 'ECF',
		parameters: ['METHOD A', 'METHOD B'],
		syntax: 'AD Approach == [ METHOD A | {METHOD B} ]',
		examples: [
			'AD Approach == METHOD A',
			'AD Approach == METHOD B'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Apply All Inverts',
		description: 'Controls whether all inverts are applied or only the first one found.',
		category: 'ECF',
		parameters: ['ON', 'OFF'],
		syntax: 'Apply All Inverts == [ {ON} | OFF ]',
		examples: [
			'Apply All Inverts == ON',
			'Apply All Inverts == OFF'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'BC Event Name',
		description: 'Specifies the boundary condition event name for subsequent Read GIS BC commands.',
		category: 'ECF',
		parameters: ['<event_name>'],
		syntax: 'BC Event Name == <event_name>',
		examples: [
			'BC Event Name == H010',
			'BC Event Name == Q100'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Bridge Flow',
		description: 'Controls the bridge flow calculation method.',
		category: 'ECF',
		parameters: ['Method A', 'Method B'],
		syntax: 'Bridge Flow == [ Method A | {Method B} ]',
		examples: [
			'Bridge Flow == Method A',
			'Bridge Flow == Method B'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Conveyance Calculation',
		description: 'Controls how conveyance is calculated in the model.',
		category: 'ECF',
		parameters: ['CHANGE IN RESISTANCE', 'ALL PARALLEL'],
		syntax: 'Conveyance Calculation == [ CHANGE IN RESISTANCE | {ALL PARALLEL} ]',
		examples: [
			'Conveyance Calculation == CHANGE IN RESISTANCE',
			'Conveyance Calculation == ALL PARALLEL'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Create Nodes',
		description: 'Controls whether nodes are automatically created in the model.',
		category: 'ECF',
		parameters: ['ON', 'OFF'],
		syntax: 'Create Nodes == [ {ON} | OFF ]',
		examples: [
			'Create Nodes == ON',
			'Create Nodes == OFF'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'CSV Format',
		description: 'Controls the format of CSV output files.',
		category: 'ECF',
		parameters: ['HORIZONTAL', 'VERTICAL'],
		syntax: 'CSV Format == [ HORIZONTAL | {VERTICAL} ]',
		examples: [
			'CSV Format == HORIZONTAL',
			'CSV Format == VERTICAL'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'CSV Time',
		description: 'Controls the time unit used in CSV output files.',
		category: 'ECF',
		parameters: ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
		syntax: 'CSV Time == [ {DAYS} | HOURS | MINUTES | SECONDS ]',
		examples: [
			'CSV Time == DAYS',
			'CSV Time == HOURS',
			'CSV Time == MINUTES',
			'CSV Time == SECONDS'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Culvert Zero Coefficients',
		description: 'Sets default values for zero coefficient attributes in culverts.',
		category: 'ECF',
		parameters: ['DEFAULT', 'OFF', 'v1, v2, v3, v4, v5'],
		syntax: 'Culvert Zero Coefficients == [ DEFAULT | {OFF} | v1, v2, v3, v4, v5 ]',
		examples: [
			'Culvert Zero Coefficients == DEFAULT',
			'Culvert Zero Coefficients == OFF',
			'Culvert Zero Coefficients == 1.0, 0.6, 0.9, 0.5, 1.0'
		],
		notes: 'Classic and HPC'
	},
	{
		name: 'Flow Area',
		description: 'Controls which area is used for flow calculations.',
		category: 'ECF',
		parameters: ['EFFECTIVE', 'TOTAL'],
		syntax: 'Flow Area == [ {EFFECTIVE} | TOTAL ]',
		examples: [
			'Flow Area == EFFECTIVE',
			'Flow Area == TOTAL'
		],
		notes: 'Classic and HPC'
	}
];
