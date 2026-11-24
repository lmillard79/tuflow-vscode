/** Audited against the official 2026.3 TUFLOW Boundary Control File appendix. */
import { defineAuditedCommands } from './audited';

export const tbcCommands = defineAuditedCommands('TBC',
    'https://docs.tuflow.com/classic-hpc/manual/2026.3/83-AppendicesD-TBCCommands.html',
    [
        {
            "name": "BC Database",
            "description": "Select the active boundary-condition CSV database.",
            "syntax": "BC Database == <.csv_file>",
            "valueKind": "file"
        },
        {
            "name": "BC Event Name",
            "description": "Select the boundary-event name (legacy; use BC Event Source for new models).",
            "syntax": "BC Event Name == <bc_event_name>",
            "valueKind": "text",
            "argumentNames": [
                "<bc_event_name>"
            ],
            "notes": "Legacy syntax retained for compatibility; BC Event Source is recommended."
        },
        {
            "name": "BC Event Source",
            "description": "Associate an event placeholder with a boundary-event name.",
            "syntax": "BC Event Source == <bc_event_text> | <bc_event_name>",
            "valueKind": "tuple",
            "argumentNames": [
                "<bc_event_text>",
                "<bc_event_name>"
            ]
        },
        {
            "name": "BC Event Text",
            "description": "Set the event substitution text (legacy; use BC Event Source).",
            "syntax": "BC Event Text == <bc_event_text>",
            "valueKind": "text",
            "notes": "Legacy syntax retained for compatibility; BC Event Source is recommended."
        },
        {
            "name": "Blank BC Type",
            "description": "Set the default BC type when a 2d_bc layer feature leaves it blank.",
            "syntax": "Blank BC Type == <bc_type> | {NONE}",
            "valueKind": "text",
            "enumValues": [
                "NONE"
            ]
        },
        {
            "name": "Blank HQ Slope",
            "description": "Supply a default HQ slope for boundary features without a slope name.",
            "syntax": "Blank HQ Slope == <slope>",
            "valueKind": "number"
        },
        {
            "name": "Global Rainfall Area Factor",
            "description": "Scale global rainfall after initial and continuing losses.",
            "syntax": "Global Rainfall Area Factor == {1.0} | <area_factor>",
            "valueKind": "number"
        },
        {
            "name": "Global Rainfall BC",
            "description": "Name the BC database series used as global rainfall.",
            "syntax": "Global Rainfall BC == <bc_name>",
            "valueKind": "text"
        },
        {
            "name": "Global Rainfall Continuing Loss",
            "description": "Set the global rainfall continuing-loss rate.",
            "syntax": "Global Rainfall Continuing Loss == {0} | <CL>",
            "valueKind": "number",
            "notes": "Specify losses before Global Rainfall BC; these settings do not apply to Read GIS RF."
        },
        {
            "name": "Global Rainfall Initial Loss",
            "description": "Set global rainfall initial loss.",
            "syntax": "Global Rainfall Initial Loss == {0} | <IL>",
            "valueKind": "number",
            "notes": "Specify losses before Global Rainfall BC; these settings do not apply to Read GIS RF."
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
            "name": "Read GIS BC",
            "description": "Read 2d_bc boundary-condition geometries.",
            "syntax": "Read GIS BC == <gis_layer>",
            "valueKind": "file",
            "argumentNames": [
                "<gis_layer>"
            ]
        },
        {
            "name": "Read GIS RF",
            "description": "Read 2d_rf rainfall polygon geometries.",
            "syntax": "Read GIS RF == <gis_layer>",
            "valueKind": "file",
            "argumentNames": [
                "<gis_layer>"
            ]
        },
        {
            "name": "Read GIS SA",
            "description": "Read source-area GIS layers; optional modifiers belong to the left of ==.",
            "syntax": "Read GIS SA [ ALL | PITS | STREAM ONLY | STREAM IGNORE | RF | PO | TRIGGER ] == <gis_layer>",
            "valueKind": "file",
        "suffixGroups": [
            { "optional": true, "alternatives": ["ALL", "PITS", "STREAM ONLY", "STREAM IGNORE"] },
            { "optional": true, "alternatives": ["RF", "PO", "TRIGGER"] }
        ],
            "argumentNames": [
                "<gis_layer>"
            ],
            "notes": "Left-of-delimiter modifiers are ALL, PITS, STREAM ONLY, STREAM IGNORE, RF, PO and TRIGGER."
        },
        {
            "name": "Read GIS Streams",
            "description": "Read stream network GIS geometries.",
            "syntax": "Read GIS Streams == <gis_layer>",
            "valueKind": "file",
            "argumentNames": [
                "<gis_layer>"
            ]
        },
        {
            "name": "Read RowCol RF",
            "description": "Read a row/column rainfall file.",
            "syntax": "Read RowCol RF == <mid_file>",
            "valueKind": "file",
            "argumentNames": [
                "<mid_file>"
            ]
        },
        {
            "name": "Spatial Database",
            "description": "Select whether spatial database settings are inherited from the TCF.",
            "syntax": "Spatial Database == OFF | TCF",
            "valueKind": "enum",
            "enumValues": [
                "OFF",
                "TCF"
            ]
        },
        {
            "name": "Unused HX and SX Connections",
            "description": "Set handling for unused HX/SX connections.",
            "syntax": "Unused HX and SX Connections == {ERROR} | WARNING",
            "valueKind": "enum",
            "enumValues": [
                "ERROR",
                "WARNING"
            ]
        }
    ]
);
