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
