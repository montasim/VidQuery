import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PopupApp } from '../../src/ui/popup/popup-app';

const sendMessage = vi.fn();

describe('popup connection workflow', () => {
    beforeEach(() => {
        sendMessage.mockReset();
        sendMessage.mockImplementation((request: { type: string }) => {
            if (request.type === 'credential:status') {
                return Promise.resolve({
                    ok: true,
                    data: { connected: false, consented: false },
                });
            }
            return Promise.resolve({
                ok: true,
                data: { connected: true, consented: true },
            });
        });
        vi.stubGlobal('chrome', {
            runtime: { sendMessage },
            sidePanel: { open: vi.fn() },
            windows: { WINDOW_ID_CURRENT: -2 },
        });
    });

    it('requires consent and saves an unvalidated key through the typed boundary', async () => {
        const user = userEvent.setup();
        render(<PopupApp />);

        const input = await screen.findByLabelText('Gemini API key');
        await user.type(input, 'gemini-test-key-123');
        await user.click(screen.getByRole('checkbox'));
        await user.click(
            screen.getByRole('button', { name: 'Save without validation' })
        );

        await waitFor(() =>
            expect(sendMessage).toHaveBeenCalledWith({
                type: 'credential:save',
                apiKey: 'gemini-test-key-123',
                validate: false,
                consented: true,
            })
        );
        expect(await screen.findByText('Gemini is connected')).toBeVisible();
    });
});
