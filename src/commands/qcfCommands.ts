/** Audited against the official 2026.3 TUFLOW Quadtree Control File appendix. */
import { defineAuditedCommands } from './audited';

export const qcfCommands = defineAuditedCommands('QCF',
    'https://docs.tuflow.com/classic-hpc/manual/2026.3/87-AppendicesH-QCFCommands.html',
    [
        {
            "name": "Base Cell Size",
            "description": "Define the Level 1 quadtree cell size or inherit from TGC.",
            "syntax": "Base Cell Size == <cell_size> | {TGC}",
            "valueKind": "number",
            "enumValues": [
                "TGC"
            ]
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
            "name": "Model Origin and Extent",
            "description": "Choose quadtree extent derived from nesting polygons or the TGC.",
            "syntax": "Model Origin and Extent == {Auto} | TGC",
            "valueKind": "enum",
            "enumValues": [
                "Auto",
                "TGC"
            ],
            "notes": "Default is TGC for Single Level mode and Auto when an explicit .qcf is supplied."
        },
        {
            "name": "Orientation Angle",
            "description": "Set mesh orientation numerically, optimise, or inherit TGC.",
            "syntax": "Orientation Angle == <angle> | Optimise | {TGC}",
            "valueKind": "number",
            "enumValues": [
                "Optimise",
                "TGC"
            ]
        },
        {
            "name": "Quadtree Mesh Processing Method",
            "description": "Choose the preprocessing memory/speed trade-off.",
            "syntax": "Quadtree Mesh Processing Method == {FAST} | Memory Efficient",
            "valueKind": "enum",
            "enumValues": [
                "FAST",
                "Memory Efficient"
            ]
        },
        {
            "name": "Read GIS Nesting",
            "description": "Read 2d_qnl GIS polygons defining quadtree refinement.",
            "syntax": "Read GIS Nesting == <gis_file_in_2d_qnl_format>",
            "valueKind": "file"
        },
        {
            "name": "Spatial Database",
            "description": "Select the TCF spatial database or disable it.",
            "syntax": "Spatial Database == OFF | TCF",
            "valueKind": "enum",
            "enumValues": [
                "OFF",
                "TCF"
            ]
        }
    ]
);
