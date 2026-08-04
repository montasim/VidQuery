# YouTube Helper UI prototype v1

This folder is a standalone visual prototype for the extension’s V2 interface. It does not change the production extension.

## Preview

Open `index.html` in a browser. Tailwind CSS and the typefaces load from CDNs, so an internet connection is required for the intended styling.

Useful direct states:

- `index.html?scene=chat`
- `index.html?scene=chat&state=loading`
- `index.html?scene=chat&state=error`
- `index.html?scene=history`
- `index.html?scene=empty`
- `index.html?scene=settings`

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
