# Security policy

## Report a vulnerability

Do not disclose credential, content-extraction, extension-message, or permission vulnerabilities in a public issue. Email [montasimmamun@gmail.com](mailto:montasimmamun@gmail.com) with:

- the affected extension version and browser version;
- reproduction steps;
- the expected and actual behavior;
- potential impact; and
- a minimal proof of concept with secrets and private video content removed.

Reports are reviewed according to severity and reproducibility. A response-time guarantee is not currently published.

## Sensitive boundaries

VidQuery treats these areas as security-sensitive:

- the device-bound encrypted Gemini credential vault;
- migration from legacy `chrome.storage.sync` credentials;
- the typed runtime protocol between popup, Side Panel, background worker, and content script;
- extraction of bounded Video Context from YouTube;
- direct requests from the background worker to Google Gemini; and
- storage access levels that exclude content-script access.

The vault encrypts the API key at rest but is not an operating-system secrets manager. A compromised browser profile, extension process, device, or malicious extension update may still expose decrypted credentials during use. Restrict and rotate the Gemini key, monitor its quota, and remove it from the popup when it is no longer needed.

Never include API keys, transcripts, questions, Gemini responses, browser storage dumps, or private video URLs in public reports.
