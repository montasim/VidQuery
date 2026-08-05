import { beforeEach, describe, expect, it } from 'vitest';
import { CredentialVault } from '../../src/infrastructure/storage/credential-vault';
import { installChromeMock } from '../helpers/chrome';

const memory = installChromeMock();

describe('device-bound Gemini credential vault', () => {
    beforeEach(async () => {
        memory.reset();
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase('youtube-helper-vault');
            request.onsuccess = () => resolve();
            request.onerror = () =>
                reject(request.error ?? new Error('Could not reset vault.'));
        });
    });

    it('persists ciphertext and restores plaintext through the device key', async () => {
        const vault = new CredentialVault();
        await vault.save('gemini-secret-key-123');
        expect(
            JSON.stringify(memory.local.get('youtube-helper.credentials'))
        ).not.toContain('gemini-secret-key-123');
        memory.session.clear();
        await expect(vault.get()).resolves.toBe('gemini-secret-key-123');
    });

    it('removes encrypted and session copies together', async () => {
        const vault = new CredentialVault();
        await vault.save('gemini-secret-key-123');
        await vault.remove();
        await expect(vault.get()).resolves.toBeNull();
        expect(memory.session.size).toBe(0);
        expect(memory.local.size).toBe(0);
    });

    it('migrates the legacy sync key only after encrypted read-back succeeds', async () => {
        memory.sync.set('geminiApiKey', 'legacy-gemini-key-123');
        const vault = new CredentialVault();
        await expect(vault.migrateLegacySyncCredential()).resolves.toBe(true);
        expect(memory.sync.has('geminiApiKey')).toBe(false);
        memory.session.clear();
        await expect(vault.get()).resolves.toBe('legacy-gemini-key-123');
    });
});
