# IONQ Decision Desk

Interactive research desk for IonQ. Replaces the 23 Sep 2026 TradingAgents committee note with live formulas.

**Not investment advice. Paper / research only.**

## Open it

- Double-click `index.html`, or
- `python3 -m http.server 8080` in this folder and visit http://localhost:8080

## Grok Build

From a terminal in this repo:

```bash
curl -fsSL https://x.ai/cli/install.sh | bash
cd ionq-decision-desk
grok
```

Then: `keep this a static desk; do not add a multi-agent debate UI`.

On grok.com, switch the mode picker to **Build**, attach this repo or paste the files, and publish to a `*.grok.me` link if you want a hosted preview.

## Model rules

- Decision price is last close **or** live tape, not a stale close on a gap morning.
- Split organic FY26 guide ($280–290M) from combined SkyWater guide ($450–460M).
- Split Adj. EBITDA / FCF from GAAP NI marks.
- Size from 1.5× ATR and a 2% weight cap.
