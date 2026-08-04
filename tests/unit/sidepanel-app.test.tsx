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
                query: vi.fn().mockResolvedValue([{ id: 42 }]),
            },
            action: { openPopup: vi.fn() },
            sidePanel: { close: vi.fn().mockResolvedValue(undefined) },
            windows: { getCurrent: vi.fn().mockResolvedValue({ id: 7 }) },
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

    it('closes the active tab-specific side panel from the header', async () => {
        const user = userEvent.setup();
        render(<SidePanelApp />);

        await user.click(
            screen.getByRole('button', { name: 'Close assistant' })
        );

        expect(chrome.sidePanel.close).toHaveBeenCalledWith({ tabId: 42 });
    });

    it('falls back to the global window panel when the tab panel is absent', async () => {
        const user = userEvent.setup();
        vi.mocked(chrome.sidePanel.close).mockRejectedValueOnce(
            new Error('No tab-specific side panel is open.')
        );
        render(<SidePanelApp />);

        await user.click(
            screen.getByRole('button', { name: 'Close assistant' })
        );

        await vi.waitFor(() =>
            expect(chrome.sidePanel.close).toHaveBeenLastCalledWith({
                windowId: 7,
            })
        );
    });

    it('offers the external SupportKori action without embedding it', () => {
        render(<SidePanelApp />);

        expect(
            screen.getByRole('link', { name: 'Support this project' })
        ).toHaveAttribute('href', 'https://www.supportkori.com/montasim');
    });
});
