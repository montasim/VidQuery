---
status: accepted
---

# Preserve existing behavior and local data boundaries during the remake

Treat V2 as an architectural and visual remake of the existing extension, not a product expansion. Preserve the behavior already established by the source code unless a change is explicitly recorded in another ADR, while making the UI conform to the revised Side Panel prototype.

## Preserved behavior

- Support YouTube watch, Shorts, and live-video routes and react to YouTube’s single-page navigation.
- Collect the current video title, channel, description, URL, duration, playback position, and transcript when available.
- Ask Gemini questions grounded in that context and expose clear loading and failure states.
- Allow a person to edit and resend a question and retry an assistant response.
- Retain up to ten Recent Videos and allow navigation back to them.
- Validate a Gemini API key during setup while retaining an explicit save-without-validation path.
- Keep API-key validation and chat requests in the background worker.

## Data boundaries

- A Conversation is temporary and is not written to extension storage.
- Transcripts, questions, and Gemini answers are not included in Recent Videos.
- A Recent Video contains only the limited metadata needed to identify and reopen it.
- The extension does not introduce analytics, telemetry, cloud synchronization, accounts, or a server-side data store.

## Consequences

- New capabilities such as saved conversations, transcript libraries, automatic summaries, exports, accounts, or publishing workflows are out of scope.
- Existing storage is migrated where practical, including the ten-item recent-video list. Legacy data that cannot be migrated safely must be left untouched rather than guessed at or silently broadened.
- Feature-parity tests must cover context extraction, video navigation, question submission, retry/edit behavior, recent-video retention, setup, consent, and Gemini errors before the legacy runtime is removed.
- The repository’s build, typecheck, lint, unit tests, extension packaging, and representative browser journeys must pass before the remake is considered complete.
