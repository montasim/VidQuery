---
status: accepted
---

# Rebuild the extension with WXT, React, and TypeScript

Replace the current copy-based Manifest V3 build and manually constructed DOM interface with a WXT extension built with React and TypeScript. Use Tailwind CSS v4 for styling and shadcn/Radix primitives for interactive UI components, with Lucide for icons; do not retain a parallel legacy runtime or a separate handcrafted component stylesheet.

## Considered options

- Keep the current JavaScript files and change only their CSS. Rejected because this would preserve the fragile global DOM construction, global selectors, and copy-only build process the remake is intended to replace.
- Add React to the existing custom build script. Rejected because WXT already supplies typed Manifest V3 entry points, Vite-based bundling, development builds, and packaging in the same manner as the reference extension.
- Use WXT with React, TypeScript, Tailwind, and shadcn. Proposed because it creates one component architecture for the popup and Side Panel while keeping browser-extension concerns explicit.

## Consequences

- The popup, Side Panel, background worker, and YouTube content script become typed WXT entry points.
- Shared messages between browser contexts require a typed protocol rather than ad hoc request objects.
- Supporting non-visual packages are allowed when they have a focused purpose, including Zod for boundary validation and a safe Markdown renderer for Gemini responses.
- Styling belongs in Tailwind utilities, theme tokens, and shadcn component variants. Small global rules may exist only for Tailwind setup, browser normalization, accessibility, or Shadow DOM boundaries.
- The legacy `content.js`, `background.js`, `popup.html`, `popup.js`, `styles.css`, and copy-based extension build script are removed after the replacement reaches feature parity and passes verification. Git history remains the archive.
