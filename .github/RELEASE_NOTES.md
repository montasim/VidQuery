## What’s new in v2.0.0

- Rebuilt YouTube Helper with WXT, React, TypeScript, Tailwind CSS, and shadcn-compatible Radix primitives.
- Moved video conversations into Chrome’s Side Panel while keeping a focused toolbar popup for Gemini setup and connection status.
- Added explicit AI-processing consent and direct bring-your-own-key access to Gemini’s eligible free tier.
- Added a device-bound AES-GCM credential vault with encrypted persistent storage, a session-only plaintext cache, trusted-context restrictions, and safe legacy-key migration.
- Preserved YouTube watch, Shorts, live-video, single-page navigation, transcript context, message editing, answer retry, and ten-item Recent Videos behavior.
- Added typed browser protocols, validated local data, actionable provider errors, Markdown answers, and unsupported-page states.
- Replaced the npm publishing workflow with extension-specific CI, build, test, ZIP, checksum, and GitHub Release automation.

## Install in Chrome

1. Download the Chrome ZIP and `SHA256SUMS.txt` attached to this release.
2. Place both files in the same folder and verify the archive:

    ```bash
    sha256sum --check SHA256SUMS.txt
    ```

3. Extract the ZIP to a permanent folder.
4. Open `chrome://extensions` in Chrome 116 or later.
5. Enable **Developer mode**.
6. Select **Load unpacked** and choose the extracted folder containing `manifest.json`.
7. Open the YouTube Helper popup, connect a Gemini API key, then open a supported YouTube video and launch the Side Panel.

Chrome loads YouTube Helper from the extracted folder, so do not delete that folder while the extension is installed. GitHub installations do not update automatically; download, verify, and load each newer release when one becomes available.
