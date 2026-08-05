# VidQuery distribution

VidQuery is built and packaged by WXT as a Chrome Manifest V3 extension. It is not an npm package and this repository does not prove a current Chrome Web Store listing.

## Build an unpacked extension

```bash
pnpm install --frozen-lockfile
pnpm check
```

The Chrome build is written to `.output/chrome-mv3/`.

To test it locally:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose `.output/chrome-mv3/`.
5. Open the popup, connect Gemini, then test the Side Panel on watch, Shorts, and live-video routes.

## Create the distributable archive

```bash
pnpm release:zip
```

`release:zip` runs the complete verification suite before WXT creates a ZIP under `.output/`. Inspect the generated manifest and archive contents before distributing it.

## Publish a GitHub Release

The tag-triggered [Release workflow](.github/workflows/release.yml) publishes the same unpacked Chrome archive pattern used by the reference extensions.

1. Update the version in `package.json` and ensure the lockfile is current.
2. Update [.github/RELEASE_NOTES.md](.github/RELEASE_NOTES.md) for that version.
3. Run `pnpm check` locally.
4. Commit and merge the release-ready changes.
5. Create and push the matching annotated tag:

    ```bash
    git tag -a v2.0.0 -m "VidQuery v2.0.0"
    git push origin v2.0.0
    ```

The workflow rejects a tag that does not equal `v` plus the version in `package.json`. A successful run publishes:

- `VidQuery-vX.Y.Z-chrome-unpacked.zip`;
- `SHA256SUMS.txt`; and
- the curated release notes from `.github/RELEASE_NOTES.md`.

The archive is validated before publication to ensure `manifest.json` is at its root. GitHub Release installations remain manual and do not update automatically.

## Release checklist

- Confirm `package.json` contains the intended extension version.
- Run `pnpm check` from a clean checkout with the committed pnpm lockfile.
- Load `.output/chrome-mv3/` into the minimum supported Chrome version.
- Verify first-time consent, validated and unvalidated key saves, key removal, and legacy-key migration.
- Verify watch, Shorts, live, unsupported-page, transcript-available, and transcript-unavailable states.
- Verify question submission, Markdown rendering, edit, retry, quota, invalid-key, and offline errors.
- Confirm Recent Videos retains at most ten records and contains no transcript, question, or answer text.
- Confirm persistent extension storage does not contain a plaintext Gemini key.
- Review requested permissions and host permissions against the accepted ADRs.
- Prepare current screenshots, store copy, privacy disclosures, and support details before a Chrome Web Store submission.

## Continuous integration

The [CI workflow](.github/workflows/ci.yml) installs the committed pnpm dependency graph and runs formatting, linting, type checking, tests, and a production build. The separate [Release workflow](.github/workflows/release.yml) runs only for matching `v*` tags. Neither workflow publishes to npm or submits to a browser store.

## Rollback

Keep the last verified extension archive before a release. If a new build fails after distribution, stop distributing it and reinstall the prior archive. Do not downgrade local credential storage by copying decrypted keys into sync or plaintext storage.
