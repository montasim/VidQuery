# YouTube Helper

YouTube Helper lets a person ask Gemini questions grounded in the YouTube video they are currently watching while keeping retained data deliberately limited.

## Language

**Video Context**:
The current YouTube video’s title, channel, description, URL, duration, playback position, and available transcript used to ground a question.
_Avoid_: Scraped data, page dump

**Conversation**:
A session-only sequence of questions and Gemini answers about one current video. It is discarded when the page session ends and is not part of Recent Videos.
_Avoid_: Saved chat, chat history

**Recent Video**:
A locally stored navigation record containing limited metadata for a previously watched video. At most ten are retained; transcripts, questions, and answers are excluded.
_Avoid_: Conversation history, archive

**Gemini Connection**:
The person’s own Gemini API credential, validated during setup and retained in a device-bound encrypted vault. Persistent storage contains ciphertext rather than the plaintext credential.
_Avoid_: Account, subscription, bundled API access

**AI Processing Consent**:
The one-time confirmation that a person understands their question and Video Context will be sent directly to Google for Gemini processing.
_Avoid_: Terms acceptance, recurring confirmation
