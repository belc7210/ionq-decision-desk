# IONQ Decision Desk

Interactive version of the 23 Sep 2026 IONQ decision model.

## What this is
A static desk: tape toggle, organic vs SkyWater guide bridge, operating vs GAAP split, three-case sales multiple, ATR position size. Defaults are research snapshots, not a live feed.

## Run
Open `index.html` in a browser. No build step.

## Do not
Do not add a 12-agent debate UI. Do not treat GAAP net income as cash. Do not collapse organic FY26 $280-290M and combined $450-460M into one raised-guidance number. Do not ship a trade ticket with entry/stop of 0.

## If extending
Keep formulas in `app.js` `recalc()`. The live price field is the session refresh. Decision price is the tape toggle.
