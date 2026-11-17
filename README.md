# Commonwealth — independent civic site

This repository is the separate public deployment for **Commonwealth**, not the NIGHTFALL research site.

**Current repository name:** `https-d3lefts.github.io-commonwealth-` (the name entered when the repository was created). Accordingly, while this name remains, its GitHub Pages project URL is:

`https://d3lefts.github.io/https-d3lefts.github.io-commonwealth-/`

The shorter intended name is `commonwealth`; repository renaming requires the owner's GitHub Settings → General → Repository name control. **Do not rename without updating the workflow's `COMMONWEALTH_ORIGIN` and rebuilding/republishing the canonical URLs.**

## Independent deployment

The GitHub Actions workflow `.github/workflows/deploy.yml` builds and verifies a pinned Commonwealth source snapshot from `d3lefts/d3lefts`, copies a vetted static release into this repository's `site/` directory, commits the snapshot, and deploys **only** those files through this repository's own GitHub Pages workflow. After the snapshot is committed, the published site serves no NIGHTFALL CSS, JavaScript, or backend resources.

To activate hosting, in this repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. Once enabled, run or rerun **Deploy Commonwealth independently**, then inspect the actual live URL and deep links.

A Pages deployment report of success and a live browser check are required before NIGHTFALL's existing Commonwealth portal changes to point here. The original NIGHTFALL site remains intact while the new site is unverified.

All public demonstrations are synthetic and nonbinding. They do not collect real voter data, authorize government actions, implement binding ballots, or establish a production legal-verification service.

## Provenance and rollback

`site/build-manifest.json` records the source commit and SHA-256 of each published file. Each release runs an independent dependency-closure audit and mobile/desktop smoke tests before publication. Rollback by reverting the committed `site/` changes and rerunning this repository's deployment, without touching NIGHTFALL.

The build reads the public upstream source to generate a release. The **deployed snapshot itself** is checked into this repository and is self-contained. The independent site does not require the research site to operate.
