---
status: accepted
---

# Offer voluntary project support through an external SupportKori link

Expose an optional **Support this project** action in the Side Panel header and a labeled **Support on SupportKori** action in the popup footer. Both actions open Montasim’s SupportKori page in a new browser tab.

## Considered options

- Omit project support from the extension. Rejected because the reference extensions expose the same voluntary support route and the maintainer explicitly requested it.
- Embed SupportKori content or a payment widget. Rejected because remote content would add unnecessary privacy, security, and review scope.
- Use ordinary external links. Accepted because support remains optional, recognizable, and isolated from extension data.

## Consequences

- Support remains visually tertiary to video questions, Gemini setup, history, and close controls.
- The extension does not load SupportKori scripts, pixels, or remote UI. SupportKori receives a request only after the person deliberately follows the external link.
- Links use `target="_blank"` and `rel="noreferrer"` and never include video context, questions, credentials, or extension state.
- The support destination is `https://www.supportkori.com/montasim` across the Side Panel, popup, prototype, and README.
