---
status: accepted
---

# Use the Chrome Side Panel for conversations and retain a focused popup

Move the primary video-question workspace from a floating element injected over YouTube into Chrome’s Side Panel. Retain the toolbar popup as a focused connection surface for first-time consent, Gemini API-key setup and validation, connection status, and an action that opens the assistant; do not duplicate the API-key form inside the Side Panel.

## Considered options

- Keep the floating in-page assistant shown in prototype V1. Rejected because the requested remake explicitly chooses the Side Panel and the reference extension demonstrates the desired WXT Side Panel pattern.
- Remove the popup and place setup in the Side Panel. Rejected because the popup is intentionally retained as the quick setup and connection surface.
- Use both the popup and Side Panel as complete application surfaces. Rejected because duplicated settings and conversation controls would create competing ownership and inconsistent state.

## Consequences

- Clicking the extension action opens the popup, not the Side Panel directly.
- The popup owns the Gemini Connection and the one-time AI Processing Consent.
- The popup’s primary post-setup action opens the Side Panel.
- The Side Panel owns the current Video Context, Conversation, loading and error feedback, message edit/retry actions, and Recent Videos.
- On a supported YouTube watch, Shorts, or live page, a content script collects bounded Video Context locally and reports it to the extension. No general page dump is collected.
- Video Context is refreshed when the panel opens or the active YouTube video changes. Nothing is sent to Gemini until the person submits a question.
- On unsupported pages or when no usable video is present, the Side Panel shows a clear empty state rather than attempting a Gemini request.
- `prototypes/v1` will be revised before production UI work so its primary composition represents the Side Panel rather than a floating page overlay.
