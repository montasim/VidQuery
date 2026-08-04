import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountAssistantLauncher } from '../../src/ui/content/launcher';

describe('YouTube assistant launcher', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        document.documentElement
            .querySelector('#youtube-helper-launcher')
            ?.remove();
    });

    it('mounts one accessible floating button and opens the assistant', async () => {
        const openAssistant = vi.fn().mockResolvedValue({ opened: true });
        mountAssistantLauncher(openAssistant);
        mountAssistantLauncher(openAssistant);

        const hosts = document.querySelectorAll('#youtube-helper-launcher');
        const button = hosts[0]?.shadowRoot?.querySelector('button');

        expect(hosts).toHaveLength(1);
        expect(button).toHaveAccessibleName(
            'Ask this video with YouTube Helper'
        );
        button?.click();
        await vi.waitFor(() => expect(openAssistant).toHaveBeenCalledOnce());
    });
});
