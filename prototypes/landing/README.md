# VidQuery landing-page prototype

This is a standalone marketing prototype built with HTML, JavaScript, and the Tailwind CSS CDN. It stays in the extension repository and embeds the existing product prototype as its live hero visual.

## Preview

Open `index.html` in a browser with an internet connection. Tailwind loads from its CDN, while the embedded product demo loads from `../v1/index.html`.

The page includes:

- responsive desktop and mobile navigation;
- direct links to the v2.0.0 Chrome ZIP and checksum release;
- an interactive product demo with conversation, recent-video, and setup states;
- product-context, privacy, installation, and FAQ sections;
- scroll-reveal motion with a reduced-motion fallback.

This prototype does not alter the production extension or introduce a landing-page build pipeline.
