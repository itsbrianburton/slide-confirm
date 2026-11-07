# Releasing

Releases are built by GitHub Actions from a tag. `dist/` is not committed; HACS installs
`slide-confirm.js` from the release assets (it has done so since v1.0.1).

## Steps

1. Make sure `v2` (or `main`) is green in CI.
2. In `CHANGELOG.md`, rename the `## [Unreleased] – X.Y.Z` heading to `## [X.Y.Z] – YYYY-MM-DD`
   and start a new `## [Unreleased]` section above it if needed.
3. Set the version and tag in one go:

   ```bash
   npm version 2.0.0 -m "Release %s"
   ```

   This updates `package.json` and `package-lock.json`, commits, and creates the tag `v2.0.0`.
   For a pre-release use `npm version 2.0.0-rc.1`; a tag with a hyphen is published as a
   GitHub pre-release, which HACS only offers to users who enabled pre-releases.

4. Push the commit and the tag:

   ```bash
   git push --follow-tags
   ```

5. The **Release** workflow checks that the tag matches `package.json`, runs `npm run check`,
   extracts the matching section of `CHANGELOG.md` as the release notes, and attaches
   `slide-confirm.js` and its source map to the release.

## Merging v2 into main

`v2` is a full rewrite, so merge it as a single step once 2.0.0 is tagged, or tag from `main`
after merging. Either way the tag must point at a commit whose `package.json` says `2.0.0`.

## Minimum Home Assistant version

`hacs.json` declares `homeassistant: 2024.8.0`. That is when `perform-action` arrived in
action configs. The `hass-action` event the card relies on has existed since 2023.7.
