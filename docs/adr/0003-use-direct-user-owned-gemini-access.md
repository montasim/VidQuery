---
status: accepted
---

# Use direct user-owned Gemini access with explicit consent

Continue using a person’s own Gemini API key to access an eligible free-tier Gemini model directly from the extension background worker. The extension will have no intermediary backend, shared embedded credential, account system, or paid subscription, and the current eligible model and endpoint will be verified against official Google documentation during implementation.

## Considered options

- Embed a shared Gemini key. Rejected because extension packages are public to the browser, so the key would be exposed and its quota could be exhausted or abused.
- Add a project-operated proxy or account service. Rejected because it expands the product beyond a UI-focused remake and creates hosting, authentication, retention, and cost responsibilities.
- Keep direct bring-your-own-key access. Proposed because it preserves the existing operating model while supporting Gemini’s free tier where Google makes it available.

## Consequences

- The Gemini Connection uses the same device-bound credential-vault pattern as the Thoughtline reference extension: encrypt the API key with AES-GCM, persist only versioned ciphertext and its unique initialization vector in `chrome.storage.local`, and keep the non-exportable 256-bit device key in IndexedDB.
- Decrypted credentials are cached only in `chrome.storage.session` for the active browser session. Persistent and session storage access is restricted to `TRUSTED_CONTEXTS` so YouTube content scripts cannot read either copy directly.
- The vault owns save, retrieve, presence-check, and removal operations. Removing the Gemini Connection clears both the encrypted persistent record and any plaintext session cache.
- The credential is device-bound and is not synchronized across signed-in browser profiles. Clearing IndexedDB makes existing ciphertext undecryptable and must surface a specific reconnect message rather than silently discarding or replacing it.
- A one-time migration reads the legacy `geminiApiKey` from `chrome.storage.sync`, validates and imports it into the encrypted vault, then removes the legacy sync value only after the encrypted value can be read back successfully.
- Setup validates the key and provides actionable invalid-key, permission, quota, and network errors.
- First-time setup requires one explicit AI Processing Consent stating that the question and Video Context, including an available transcript, are sent directly to Google.
- Consent is stored locally and is not requested again unless local extension data is cleared or the consent contract materially changes.
- Gemini calls occur only in the background worker. Content scripts and React UI entry points never call Gemini directly.
- Prompts remain grounded in the current Video Context and must say when that context is insufficient rather than presenting unsupported claims as video facts.
- Unit tests must prove that persisted storage does not contain plaintext, session-cache clearing still permits decryption from the device key, removal clears both copies, an unavailable device key produces a recoverable reconnect state, and legacy sync migration never deletes the source credential before successful encrypted read-back.
