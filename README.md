# Commonwealth — Independent Civic Platform

**Repository:** [d3lefts/commonwealth](https://github.com/d3lefts/commonwealth)

**Public site:** https://d3lefts.github.io/commonwealth/

This is the standalone, publicly deployed Commonwealth static product, with its
own repository, Pages release workflow, and rollback history. It is separate
from the NIGHTFALL research website.

## Provenance and deployment

- Workflow: `.github/workflows/deploy.yml`
- Pin: `d3lefts/d3lefts` source revision recorded by each release in
  `site/build-manifest.json`.
- The workflow builds the allowlisted Commonwealth-only site, validates local
  links and source/published file SHA-256 checksums, runs Chromium browser tests
  at mobile and desktop widths, and commits the verified `site/` snapshot.
- The publication job deploys the snapshot from this repository using GitHub
  Pages actions. Publication does not require NIGHTFALL's CSS or JavaScript.

The public site is a synthetic research demonstration: no real voter data,
binding voting, institutional approval, verified legal authority, or production
backend is implied.

## Recovery

Use this repository's `main` history and the saved Actions artifact to revert
or rebuild Commonwealth without altering NIGHTFALL. No release should silently
advance a formal research certificate or legal authority state.

The distinct external NIGHTFALL research origin is
https://d3lefts.github.io/d3lefts/.
