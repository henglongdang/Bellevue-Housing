# The Bellevue REET Project

A static civic data website scaffold exploring how Bellevue's local real estate excise tax (REET) affects listing behavior, buyer affordability, and infrastructure funding trade-offs.

## What is included

- Fixed responsive navigation for five primary sections.
- Full-screen landing hero with video-background placeholder and calls to action.
- Interactive "Squeeze & Inflate" market-flow diagram.
- REET comparison calculator using Washington's graduated state REET brackets and local-rate scenarios.
- Prototype King County local REET heat map with hover/focus tooltips.
- Human-cost section with an audio placeholder, interview timeline, quotes, and field artifacts.
- Civic-dilemma split-screen analysis and reflection textarea.
- Mobilize page with a mailto council form and downloadable text advocacy placeholders.
- Technical blueprint section covering routes, data models, API plan, and quality expectations.

## Run locally

```bash
npm start
```

Then open <http://127.0.0.1:4173>. The server binds to `0.0.0.0` by default for preview environments and honors `PORT`/`HOST` when provided.

## Test

```bash
npm test
```

The tests validate the REET calculator math and a small set of accessibility-oriented structural requirements.

## Source notes

The copy and JavaScript comments reference the following source categories requested in the project brief:

- Washington Department of Revenue REET graduated and local-rate tables.
- MRSC guidance on REET 1, REET 2, RCW 82.46, and eligible capital project uses.
- Washington Research Council policy analysis on tax shifting and transaction effects.
- Redfin Bellevue housing-market snapshot for market-cooling context.

This repository intentionally avoids binary assets. Replace text placeholders through the publishing workflow or external hosting for final licensed video, audio, PDF, ZIP, and image files before publication.
