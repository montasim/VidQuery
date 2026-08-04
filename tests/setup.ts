import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto is required for credential-vault tests.');
}
