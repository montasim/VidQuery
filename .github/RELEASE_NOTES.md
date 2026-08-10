## What’s new in v2.1.0

- Moved the popup Support action into the header so it stays visible alongside the VidQuery brand.
- Shortened the action label to **Support** while keeping the same external SupportKori destination and privacy boundary.
- Simplified local installation by writing unpacked extension files directly to `apps/extension/.output/`.
- Updated automated tests and installation documentation for the refined header and flattened build output.

## Install in Chrome

1. Download the Chrome ZIP and `SHA256SUMS.txt` attached to this release.
2. Place both files in the same folder and verify the archive:

    ```bash
    sha256sum --check SHA256SUMS.txt
    ```

3. Extract the ZIP to a permanent folder.
4. Open `chrome://extensions` in Chrome 141 or later.
5. Enable **Developer mode**.
6. Select **Load unpacked** and choose the extracted folder containing `manifest.json`.
7. Open the VidQuery popup, connect a Gemini API key, then open a supported YouTube video and launch the Side Panel.

Chrome loads VidQuery from the extracted folder, so do not delete that folder while the extension is installed. GitHub installations do not update automatically; download, verify, and load each newer release when one becomes available.
