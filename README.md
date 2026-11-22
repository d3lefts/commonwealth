# Commonwealth — dedicated civic platform

**Independent product repository:** `d3lefts/commonwealth`

**Live release target:** https://d3lefts.github.io/commonwealth/

This repository contains Commonwealth's standalone public static source and
all of its release and verification code. No NIGHTFALL checkout, shared
stylesheet, navigation script, backend, credentials, or runtime fetch is
required to build, test, deploy, or restore Commonwealth.

## Editing and releasing

The published source lives in `site/`, containing the civic gateway, workbench,
Discover, historical browser application, and synthetic Living Voter demo.
Edit `site/` and stage the same static bytes at the repository root for
compatibility with either supported GitHub Pages publishing mode. Root and site
are compared **byte for byte** by the verifier. Both modes use the exact
`https://d3lefts.github.io/commonwealth/` canonical URL.

Changes to site assets or release scripts trigger independent CI:
- Static dependency closure, provenance SHA-256 and both Pages layouts;
- Mobile and desktop journey replay using Chromium and locally served assets;
- GitHub Pages upload and publication from `site/`;
- External HTTP verification against the exact committed file hashes.

A failed verifier stops publication. Review and merge changes through this
repository's pull requests; the CI check runs on pull requests without
deploying. An authorized person can roll back through this repository's
commit history and re-run the workflow, without modifying NIGHTFALL.

## Scientific lineage and limitations

The original source of this snapshot was commit
`240f590a1d44f6a910754ea87c43507eebcb6ae8` in
`d3lefts/d3lefts`; file-level provenance is in
`site/build-manifest.json`. That research repository is historical
provenance, **not a current build dependency or controlling authority**.

All data and participants in the demonstration are synthetic or illustrative.
The project is not an authorized election service, official ballot, live legal
precedent platform, consented government pilot, or production identity store.
Nothing in this release certifies actual governmental legitimacy.

For a later custom-domain launch, canonical/sitemap/manifest revisions,
GitHub Pages settings, TLS and redirects require separately verified approval.

## Role-based first-visit experience

The standalone civic site now links to a role-specific, local-only demonstration at `commonwealth-browser/index.html#cwexp`: resident sample preference, invented viewpoint groups, representative accountability path and conceptual read-only developer access. This is independent of the existing `journey.html` four-stage tour. No actual public opinion sample, government authority, operational MCP endpoint or personal preference collection is represented. New experience assets and root/site mirrors are SHA-256 pinned in the independent release manifest; browser CI exercises all roles, preference reset, the evidence gap and both viewport sizes.

## Civic Trade-off Lab (fictional, local-only)

Open [the Civic Trade-off Lab](https://d3lefts.github.io/commonwealth/civic-tradeoffs.html) from the Commonwealth homepage. The original implementation borrows *interaction concepts* from the City of DeLand's [Amendment 3 civic budget explainer](https://amendment-3.delandfl.gov/): a guided explanation, live funding-gap progress, budget levers, visible assumptions, and a shareable summary. No DeLand copy, municipal datasets, imagery, proprietary source code, or visual brand assets are reused.

The Harborview budget is an **invented educational fixture**. Two scenarios ($2.4M and $3.2M gaps), nine illustrative choices, and a stepped general-revenue lever use exact integer-dollar arithmetic in `civic-tradeoffs-core.mjs`. `civic-tradeoffs.mjs` draws the interactive UI with no network calls, persistence, official submissions or voter survey capture. Copy and JSON download require explicit clicks; the receipt preserves model version, assumptions, and selections without claiming legal or fiscal certification. The evidence vocabulary links back to The Warrant.

Audit a full Cartesian product of the two gap scenarios, all 512 choice subsets, and all 16 lever steps (16,384 cases) with `node scripts/test_civic_tradeoffs.mjs`. CI also executes the page at 390px and 1280px, checking live recomputation, stress scenario, reset, overflow, and absence of preference storage. All published assets are mirrored under `site/` and the root, and pinned in `site/build-manifest.json`.

**Promotion boundary:** A passed arithmetic/browser check certifies only the deterministic fictional exercise, not its viability as public policy. Any real-jurisdiction data integration, fiscal model, feedback submission or sharing of sensitive political preferences requires a separately reviewed source/consent/authority design.

## Naming and connected civic-decision trail

**The Warrant** is the sole current public evidence-record family name. The public decision Warrant states authority, evidence, and assurance. A *technical-check Warrant* has a narrower deterministic-check scope; a *process Warrant* would concern procedural legitimacy and institutional approvals. None is a judicial warrant, legal authorization, binding election, or fiscal certification. Legacy source identifiers containing `passport` are retained only for compatibility, never as public product names.

The <a href="https://d3lefts.github.io/commonwealth/civic-tradeoffs.html#builder">Civic Trade-off Lab</a> now joins three visible stages without sharing personal state across pages:

1. **Costs:** a local plan with exact-integer budget arithmetic and qualitative trade-off prompts.
2. **Living Voter:** a completely optional in-memory stance on that exact fictional package; modifying any cost assumption clears the stance instead of misrepresenting agreement with a changed plan.
3. **The Warrant:** a live illustrative `CW-W-HARBORVIEW-001` record with typed limitations. It separates `NOT_ESTABLISHED` authority, `SYNTHETIC_UNVERIFIED` model source, `REPLAYABLE_MODEL_ARITHMETIC` costs, `NOT_ASSESSED` equity/legal effects, `NO_COMPARABLE_RECORDED_VOTE` representation and `ARITHMETIC_REPLAY_SCOPE_ONLY` assurance.

Copy and JSON export carry the model and (only if explicitly provided) the hypothetical stance. There is no network request or browser storage and no direct sync with the separate Living Voter demo. Cross-links lead back to the fictional demonstration and to the Warrant's public evidence vocabulary; they do not transfer real or simulated personal answers. The existing participatory workbench uses a **different** synthetic budget model.

The independent model test replays **16,384** plan configurations and independently checks Warrant cost arithmetic and evidence statuses. Browser CI tests stance resets, source links and accessible phone/desktop layouts. The static audit rejects obsolete public-facing Proof Passport terminology. All site assets and root mirrors remain pinned by the release SHA-256 manifest.

Real fiscal imports, data custody, resident participation, policy predictions, ballot functions, and institutional Warrants require explicit jurisdiction, consent, verified sources, privacy/security testing and human approval.
