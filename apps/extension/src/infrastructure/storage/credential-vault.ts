import { z } from 'zod';
import { AppError } from '../../application/errors';

const DATABASE_NAME = 'youtube-helper-vault';
const DATABASE_VERSION = 1;
const KEY_STORE = 'device-keys';
const DEVICE_KEY_ID = 'credential-key-v1';
const CREDENTIALS_KEY = 'youtube-helper.credentials';
const SESSION_CREDENTIALS_KEY = 'youtube-helper.session-credentials';

const encryptedCredentialSchema = z.object({
    algorithm: z.literal('AES-GCM'),
    iv: z.string().min(1),
    ciphertext: z.string().min(1),
    version: z.literal(1),
});

export class CredentialVault {
    async save(apiKey: string): Promise<void> {
        const value = apiKey.trim();
        if (value.length < 10 || value.length > 500) {
            throw new AppError(
                'credential-invalid',
                'Enter a valid Gemini API key.'
            );
        }
        const key = await getDeviceKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            new TextEncoder().encode(value)
        );
        await chrome.storage.local.set({
            [CREDENTIALS_KEY]: {
                algorithm: 'AES-GCM',
                iv: toBase64(iv),
                ciphertext: toBase64(new Uint8Array(ciphertext)),
                version: 1,
            },
        });
        await chrome.storage.session.set({ [SESSION_CREDENTIALS_KEY]: value });
    }

    async get(): Promise<string | null> {
        const session = await chrome.storage.session.get(
            SESSION_CREDENTIALS_KEY
        );
        if (typeof session[SESSION_CREDENTIALS_KEY] === 'string') {
            return session[SESSION_CREDENTIALS_KEY] as string;
        }
        const result = await chrome.storage.local.get(CREDENTIALS_KEY);
        const encrypted = encryptedCredentialSchema.safeParse(
            result[CREDENTIALS_KEY]
        );
        if (!encrypted.success) return null;
        try {
            const plaintext = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: fromBase64(encrypted.data.iv) },
                await getDeviceKey(),
                fromBase64(encrypted.data.ciphertext)
            );
            const apiKey = new TextDecoder().decode(plaintext);
            await chrome.storage.session.set({
                [SESSION_CREDENTIALS_KEY]: apiKey,
            });
            return apiKey;
        } catch (error) {
            throw new AppError(
                'credential-invalid',
                'The saved Gemini key cannot be unlocked on this device. Reconnect Gemini.',
                error
            );
        }
    }

    async has(): Promise<boolean> {
        const result = await chrome.storage.local.get(CREDENTIALS_KEY);
        return encryptedCredentialSchema.safeParse(result[CREDENTIALS_KEY])
            .success;
    }

    async remove(): Promise<void> {
        await Promise.all([
            chrome.storage.local.remove(CREDENTIALS_KEY),
            chrome.storage.session.remove(SESSION_CREDENTIALS_KEY),
        ]);
    }

    async migrateLegacySyncCredential(): Promise<boolean> {
        if (await this.has()) return false;
        const legacy = await chrome.storage.sync.get('geminiApiKey');
        const value = legacy.geminiApiKey;
        if (typeof value !== 'string' || value.trim().length < 10) return false;
        await this.save(value);
        if ((await this.get()) !== value.trim()) {
            throw new AppError(
                'storage-failed',
                'The existing Gemini key could not be migrated safely.'
            );
        }
        await chrome.storage.sync.remove('geminiApiKey');
        return true;
    }
}

async function getDeviceKey(): Promise<CryptoKey> {
    const database = await openDatabase();
    try {
        const existing = await requestResult(
            database
                .transaction(KEY_STORE, 'readonly')
                .objectStore(KEY_STORE)
                .get(DEVICE_KEY_ID)
        );
        if (existing instanceof CryptoKey) return existing;
        const created = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        const transaction = database.transaction(KEY_STORE, 'readwrite');
        transaction.objectStore(KEY_STORE).put(created, DEVICE_KEY_ID);
        await transactionComplete(transaction);
        return created;
    } finally {
        database.close();
    }
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(KEY_STORE)) {
                request.result.createObjectStore(KEY_STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
            reject(
                request.error ?? new Error('Could not open credential vault.')
            );
    });
}

function requestResult(request: IDBRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as unknown);
        request.onerror = () =>
            reject(
                request.error ?? new Error('Could not read credential vault.')
            );
    });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
            reject(transaction.error ?? new Error('Credential update failed.'));
        transaction.onabort = () =>
            reject(
                transaction.error ?? new Error('Credential update stopped.')
            );
    });
}

function toBase64(value: Uint8Array): string {
    let binary = '';
    for (const byte of value) binary += String.fromCharCode(byte);
    return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export const credentialVault = new CredentialVault();
