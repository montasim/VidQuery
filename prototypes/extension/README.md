# VidQuery UI prototype v1

This folder is a standalone visual prototype for the extension’s V2 interface. It does not change the production extension.

## Preview

Open `v1.html` in a browser. Tailwind CSS and the typefaces load from CDNs, so an internet connection is required for the intended styling.

Useful direct states:

- `v1.html?scene=chat`
- `v1.html?scene=chat&state=loading`
- `v1.html?scene=chat&state=error`
- `v1.html?scene=history`
- `v1.html?scene=empty`
- `v1.html?scene=settings`

The prototype toolbar can also switch between every state without reloading.

## Product contract represented

- The toolbar popup owns Gemini setup, validation, consent, and connection status.
- The conversation workspace lives in Chrome’s Side Panel beside the current YouTube tab.
- Opening the Side Panel shows the current video context and a conversational question flow.
- Answers are grounded in the video metadata and transcript when available.
- A person can edit a question, retry an answer, and revisit up to ten recent videos.
- Gemini API-key configuration remains in the extension popup.
- No publishing, summarization library, account system, or server-backed feature is introduced.

## Design direction

The interface uses a quiet graphite and porcelain palette so the host video remains primary. YouTube red is reserved for active actions and playback context. A transcript timeline in the Side Panel header makes the extension’s otherwise invisible context extraction legible without turning the interface into an AI dashboard.
