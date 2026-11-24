/** Audited against the official 2026.3 TUFLOW ESTRY Control File appendix. */
import { defineAuditedCommands } from './audited';

export const ecfCommands = defineAuditedCommands('ECF',
    'https://docs.tuflow.com/classic-hpc/manual/2026.3/81-AppendicesB-ECFCommands.html',
    [
        {
            "name": "1D Node Invert Approach",
            "description": "Choose how 1D node invert values affect NA table bottoms.",
            "syntax": "1D Node Invert Approach == {Method A} | Method B",
            "valueKind": "enum",
            "enumValues": [
                "Method A",
                "Method B"
            ]
        },
        {
            "name": "AD Approach",
            "description": "Choose the 1D advection-dispersion approach.",
            "syntax": "AD Approach == METHOD A | {METHOD B}",
            "valueKind": "enum",
            "enumValues": [
                "METHOD A",
                "METHOD B"
            ]
        },
        {
            "name": "Apply All Inverts",
            "description": "Apply invert attributes to all 1D channels; legacy option.",
            "syntax": "Apply All Inverts == {ON} | OFF",
            "valueKind": "enum",
            "enumValues": [
                "ON",
                "OFF"
            ],
            "notes": "Documented legacy command; avoid suggesting as a modern default."
        },
        {
            "name": "BC Database",
            "description": "Select the active boundary-condition CSV database.",
            "syntax": "BC Database == <.csv_file>",
            "valueKind": "file"
        },
        {
            "name": "BC Event Name",
            "description": "Set a boundary event name; legacy—use BC Event Source.",
            "syntax": "BC Event Name == <bc_event_name>",
            "valueKind": "text",
            "notes": "Documented legacy command; avoid suggesting as a modern default.",
            "argumentNames": [
                "<bc_event_name>"
            ]
        },
        {
            "name": "BC Event Source",
            "description": "Map boundary event substitution text to an event name.",
            "syntax": "BC Event Source == <bc_event_text> | <bc_event_name>",
            "valueKind": "tuple",
            "argumentNames": [
                "<bc_event_text>",
                "<bc_event_name>"
            ]
        },
        {
            "name": "Bridge Flow",
            "description": "Select the 1D bridge-flow calculation method.",
            "syntax": "Bridge Flow == Method A | {Method B}",
            "valueKind": "enum",
            "enumValues": [
                "Method A",
                "Method B"
            ]
        },
        {
            "name": "Conveyance Calculation",
            "description": "Choose how 1D conveyance combines resistance components.",
            "syntax": "Conveyance Calculation == CHANGE IN RESISTANCE | {ALL PARALLEL}",
            "valueKind": "enum",
            "enumValues": [
                "CHANGE IN RESISTANCE",
                "ALL PARALLEL"
            ]
        },
        {
            "name": "Create Nodes",
            "description": "Allow or disable automatic 1D node creation.",
            "syntax": "Create Nodes == {ON} | OFF",
            "valueKind": "enum",
            "enumValues": [
                "ON",
                "OFF"
            ]
        },
        {
            "name": "CSV Format",
            "description": "Select the layout of 1D CSV results.",
            "syntax": "CSV Format == HORIZONTAL | {VERTICAL}",
            "valueKind": "enum",
            "enumValues": [
                "HORIZONTAL",
                "VERTICAL"
            ]
        },
        {
            "name": "CSV Time",
            "description": "Select time units for 1D CSV output.",
            "syntax": "CSV Time == {DAYS} | HOURS | MINUTES | SECONDS",
            "valueKind": "enum",
            "enumValues": [
                "DAYS",
                "HOURS",
                "MINUTES",
                "SECONDS"
            ]
        },
        {
            "name": "Culvert Zero Coefficients",
            "description": "Set handling of zero or empty culvert coefficients.",
            "syntax": "Culvert Zero Coefficients == DEFAULT | {OFF} | v1, v2, v3, v4, v5",
            "valueKind": "tuple",
            "enumValues": [
                "DEFAULT",
                "OFF"
            ],
            "argumentNames": [
                "v1",
                "v2",
                "v3",
                "v4",
                "v5"
            ]
        },
        {
            "name": "Depth Discharge Database",
            "description": "Select a CSV database of depth-discharge curves for Q channels.",
            "syntax": "Depth Discharge Database == <depth_discharge_dbase.csv>",
            "valueKind": "file"
        },
        {
            "name": "Flow Area",
            "description": "Choose effective or total 1D cross-section flow area.",
            "syntax": "Flow Area == {EFFECTIVE} | TOTAL",
            "valueKind": "enum",
            "enumValues": [
                "EFFECTIVE",
                "TOTAL"
            ]
        },
        {
            "name": "Flow Calculation",
            "description": "Choose 1D channel-flow calculation approach.",
            "syntax": "Flow Calculation == Method A | {Method B}",
            "valueKind": "enum",
            "enumValues": [
                "Method A",
                "Method B"
            ]
        },
        {
            "name": "If Event",
            "description": "Condition subsequent commands on selected event names.",
            "syntax": "If Event == <e1> | <e2> | …",
            "valueKind": "text"
        },
        {
            "name": "If Scenario",
            "description": "Condition subsequent commands on selected scenario names.",
            "syntax": "If Scenario == <s1> | <s2> | …",
            "valueKind": "text"
        },
        {
            "name": "Manhole Approach",
            "description": "Select automatic manhole definition method.",
            "syntax": "Manhole Approach == METHOD A | METHOD B | {METHOD C}",
            "valueKind": "enum",
            "enumValues": [
                "METHOD A",
                "METHOD B",
                "METHOD C"
            ]
        },
        {
            "name": "Output Folder",
            "description": "Specify the location for ESTRY output files.",
            "syntax": "Output Folder == <folder>",
            "valueKind": "text"
        },
        {
            "name": "Pit Inlet Database",
            "description": "Select the CSV database for pit inlet curves.",
            "syntax": "Pit Inlet Database == <pit_inlet_dbase.csv>",
            "valueKind": "file"
        },
        {
            "name": "Read File",
            "description": "Include another ECF control file.",
            "syntax": "Read File == <file>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS BC",
            "description": "Read 1D boundary-condition GIS geometries.",
            "syntax": "Read GIS BC == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS Manhole",
            "description": "Read the 1d_mh manhole GIS layer.",
            "syntax": "Read GIS Manhole == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS Network",
            "description": "Read 1d_nwk network GIS geometries.",
            "syntax": "Read GIS Network == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS Node",
            "description": "Read 1D node GIS geometries.",
            "syntax": "Read GIS Node == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS Pits",
            "description": "Read 1D pit GIS geometries.",
            "syntax": "Read GIS Pits == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS Table Links",
            "description": "Read GIS links to cross-section and other 1D tables.",
            "syntax": "Read GIS Table Links == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Spatial Database",
            "description": "Choose whether to inherit the spatial database from the TCF.",
            "syntax": "Spatial Database == OFF | TCF",
            "valueKind": "enum",
            "enumValues": [
                "OFF",
                "TCF"
            ]
        },
        {
            "name": "Timestep",
            "description": "Set the 1D ESTRY computational timestep in seconds.",
            "syntax": "Timestep == <timestep_in_seconds>",
            "valueKind": "number"
        },
        {
            "name": "XS Database",
            "description": "Select a cross-section database file.",
            "syntax": "XS Database == <file>",
            "valueKind": "file"
        }
    ]
);
