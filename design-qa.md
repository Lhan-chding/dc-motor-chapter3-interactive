# Design QA

## Scope

- `#/section/3-6`: textbook Figure 3.12 four-quadrant layout
- `#/section/3-7`: textbook Figures 3.14 and 3.15 comparison
- `#/section/3-7-1`: shunt motor circuit and characteristic
- `#/section/3-7-2`: series motor circuit and characteristic

## Checks

- Desktop viewport: no document-level horizontal overflow.
- Textbook topology: Figure 3.12 quadrant circuits, Figure 3.14 shunt branches, and Figure 3.15 series path match the supplied references.
- Interactions: weak-field and near-no-load actions update values and operating points.
- Narrow screens: textbook SVGs keep a readable minimum width inside a contained horizontal scroller.
- Build and tests: passed.

Final result: passed.
