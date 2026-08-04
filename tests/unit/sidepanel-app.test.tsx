import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SidePanelApp } from '../../src/ui/sidepanel/sidepanel-app';

const listeners = { addListener: vi.fn(), removeListener: vi.fn() };

describe('Side Panel entry states', () => {
    afterEach(cleanup);

    beforeEach(() => {
        vi.stubGlobal('chrome', {
            runtime: {
                sendMessage: vi.fn((request: { type: string }) => {
                    if (request.type === 'credential:status') {
                        return Promise.resolve({
                            ok: true,
                            data: { connected: false, consented: false },
                        });
                    }
                    if (request.type === 'recent:list') {
                        return Promise.resolve({ ok: true, data: [] });
                    }
                    return Promise.resolve({
                        ok: false,
                        code: 'context-unavailable',
                        message: 'Open a YouTube video.',
                    });
                }),
                onMessage: listeners,
                getURL: vi.fn(),
            },
            tabs: {
                onActivated: listeners,
                onUpdated: listeners,
                create: vi.fn(),
                update: vi.fn(),
            },
            action: { openPopup: vi.fn() },
            sidePanel: { close: vi.fn().mockResolvedValue(undefined) },
            windows: { WINDOW_ID_CURRENT: -2 },
        });
    });

    it('directs a disconnected person to the popup instead of showing chat controls', async () => {
        render(<SidePanelApp />);
        expect(await screen.findByText('Connect Gemini first')).toBeVisible();
        expect(
            screen.getByRole('button', { name: 'Open connection setup' })
        ).toBeVisible();
        expect(
            screen.queryByPlaceholderText('Ask about this video…')
        ).not.toBeInTheDocument();
    });

    it('closes the current window side panel from the header', async () => {
        const user = userEvent.setup();
        render(<SidePanelApp />);

        await user.click(
            screen.getByRole('button', { name: 'Close assistant' })
        );

        expect(chrome.sidePanel.close).toHaveBeenCalledWith({ windowId: -2 });
    });
});
