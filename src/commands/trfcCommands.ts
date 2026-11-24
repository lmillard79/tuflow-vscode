/** Audited against the official 2026.3 TUFLOW Rainfall Control File appendix. */
import { defineAuditedCommands } from './audited';

export const trfcCommands = defineAuditedCommands('TRFC',
    'https://docs.tuflow.com/classic-hpc/manual/2026.3/85-AppendicesF-TRFCCommands.html',
    [
        {
            "name": "IDW Exponent",
            "description": "Set inverse-distance weighting exponent.",
            "syntax": "IDW Exponent == <p> | {2}",
            "valueKind": "number"
        },
        {
            "name": "IDW Maximum Distance",
            "description": "Set maximum point distance for IDW interpolation.",
            "syntax": "IDW Maximum Distance == <max_dist>",
            "valueKind": "number"
        },
        {
            "name": "IDW Maximum Points",
            "description": "Limit the number of points considered for IDW interpolation.",
            "syntax": "IDW Maximum Points == <max_points>",
            "valueKind": "number"
        },
        {
            "name": "If Event",
            "description": "Condition subsequent commands on event names.",
            "syntax": "If Event == <e1> | <e2> | …",
            "valueKind": "text"
        },
        {
            "name": "If Scenario",
            "description": "Condition subsequent commands on scenario names.",
            "syntax": "If Scenario == <s1> | <s2> | …",
            "valueKind": "text"
        },
        {
            "name": "Maximum Hyetograph Points",
            "description": "Legacy pre-2026.0 memory limit, now ignored by TUFLOW.",
            "syntax": "Maximum Hyetograph Points == <max_pts> | {1,000}",
            "valueKind": "number",
            "notes": "Legacy: as of TUFLOW 2026.0 the number is allocated dynamically; the command is ignored and CHECK 2624 is issued."
        },
        {
            "name": "Maximum RF Locations",
            "description": "Legacy pre-2026.0 point limit, now ignored by TUFLOW.",
            "syntax": "Maximum RF Locations == <max_rf_gauges> | {1,000}",
            "valueKind": "number",
            "notes": "Legacy: as of TUFLOW 2026.0 the number is allocated dynamically; the command is ignored and CHECK 2624 is issued."
        },
        {
            "name": "Read GIS RF Point",
            "description": "Read rainfall gauge locations in 2d_rf format.",
            "syntax": "Read GIS RF Point == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS RF Polygons",
            "description": "Read rainfall regions for polygon interpolation.",
            "syntax": "Read GIS RF Polygons == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "Read GIS RF Triangles",
            "description": "Read triangle regions for TIN interpolation.",
            "syntax": "Read GIS RF Triangles == <gis_layer>",
            "valueKind": "file"
        },
        {
            "name": "RF Grid Cell Size",
            "description": "Set the rainfall interpolation grid cell size.",
            "syntax": "RF Grid Cell Size == <value>",
            "valueKind": "number"
        },
        {
            "name": "RF Grid Format",
            "description": "Choose rainfall grid output format.",
            "syntax": "RF Grid Format == ASC | FLT | NC | TIF",
            "valueKind": "enum",
            "enumValues": [
                "ASC",
                "FLT",
                "NC",
                "TIF"
            ]
        },
        {
            "name": "RF Grid Origin",
            "description": "Set X/Y coordinates of the rainfall grid origin.",
            "syntax": "RF Grid Origin == <OX>, <OY>",
            "valueKind": "tuple",
            "argumentNames": [
                "<OX>",
                "<OY>"
            ]
        },
        {
            "name": "RF Grid Size (N,M)",
            "description": "Set rainfall grid dimensions in rows and columns.",
            "syntax": "RF Grid Size (N,M) == <rows>, <columns>",
            "valueKind": "tuple",
            "argumentNames": [
                "<rows>",
                "<columns>"
            ]
        },
        {
            "name": "RF Grid Size (X,Y)",
            "description": "Set rainfall grid dimensions in physical X and Y length.",
            "syntax": "RF Grid Size (X,Y) == <X_length>, <Y_length>",
            "valueKind": "tuple",
            "argumentNames": [
                "<X_length>",
                "<Y_length>"
            ]
        },
        {
            "name": "RF Interpolation Method",
            "description": "Select rainfall interpolation algorithm.",
            "syntax": "RF Interpolation Method == IDW | POLYGON | TIN",
            "valueKind": "enum",
            "enumValues": [
                "IDW",
                "POLYGON",
                "TIN"
            ]
        }
    ]
);
