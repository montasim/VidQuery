import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SidePanelApp } from '../../src/ui/sidepanel/sidepanel-app';

const listeners = { addListener: vi.fn(), removeListener: vi.fn() };
const sendMessage = vi.fn();

describe('Side Panel entry states', () => {
    afterEach(cleanup);

    beforeEach(() => {
        listeners.addListener.mockClear();
        listeners.removeListener.mockClear();
        sendMessage.mockReset();
        sendMessage.mockImplementation((request: { type: string }) => {
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
        });
        vi.stubGlobal('chrome', {
            runtime: {
                sendMessage,
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

    it('right-aligns message actions and supports copy and answer retry', async () => {
        const context = {
            id: 'video-1',
            title: 'A useful video',
            channel: 'Field Notes',
            description: 'A full description.',
            duration: 600,
            currentTime: 42,
            url: 'https://www.youtube.com/watch?v=video-1',
            transcript: 'Useful transcript.',
            transcriptStatus: 'available',
            comments: '',
            commentsStatus: 'unavailable',
        };
        sendMessage.mockImplementation(
            (request: { type: string; question?: string }) => {
                if (request.type === 'credential:status')
                    return Promise.resolve({
                        ok: true,
                        data: { connected: true, consented: true },
                    });
                if (request.type === 'recent:list')
                    return Promise.resolve({ ok: true, data: [] });
                if (request.type === 'context:get')
                    return Promise.resolve({ ok: true, data: context });
                if (request.type === 'chat:ask')
                    return Promise.resolve({
                        ok: true,
                        data: {
                            answer: 'The answer is in the description.',
                            context,
                        },
                    });
                return Promise.reject(new Error('Unexpected request'));
            }
        );
        const user = userEvent.setup();
        const clipboardWrite = vi.spyOn(navigator.clipboard, 'writeText');
        render(<SidePanelApp />);

        const input = await screen.findByPlaceholderText(
            'Ask about this video…'
        );
        const runtimeListener = listeners.addListener.mock.calls.find(
            ([listener]) => listener.length === 1
        )?.[0] as ((event: unknown) => void) | undefined;
        expect(runtimeListener).toBeDefined();
        act(() =>
            runtimeListener?.({
                type: 'context:playback',
                videoId: 'video-1',
                currentTime: 84,
                duration: 600,
                playing: true,
            })
        );
        expect(screen.getByText('1:24 / 10:00')).toBeVisible();
        expect(
            screen.getByLabelText(
                'Transcript available. 14% played. Video playing.'
            )
        ).toBeVisible();

        await user.type(input, 'Where is the answer?');
        await user.click(screen.getByRole('button', { name: 'Send question' }));
        expect(
            await screen.findByText('The answer is in the description.')
        ).toBeVisible();

        const edit = screen.getByRole('button', { name: 'Edit question' });
        const copyQuestion = screen.getByRole('button', {
            name: 'Copy question',
        });
        const copyAnswer = screen.getByRole('button', { name: 'Copy answer' });
        const retryAnswer = screen.getByRole('button', {
            name: 'Retry answer',
        });
        expect(edit.parentElement).toHaveClass('justify-end');
        expect(edit.nextElementSibling).toBe(copyQuestion);
        expect(retryAnswer.nextElementSibling).toBe(copyAnswer);

        await user.click(copyQuestion);
        expect(clipboardWrite).toHaveBeenCalledWith('Where is the answer?');
        expect(
            screen.getByRole('button', { name: 'Copied question' })
        ).toBeVisible();

        await user.click(copyAnswer);
        expect(clipboardWrite).toHaveBeenCalledWith(
            'The answer is in the description.'
        );

        await user.click(retryAnswer);
        await vi.waitFor(() =>
            expect(
                sendMessage.mock.calls.filter(
                    ([request]) => request.type === 'chat:ask'
                )
            ).toHaveLength(2)
        );
        const chatRequests = sendMessage.mock.calls.filter(
            ([request]) => request.type === 'chat:ask'
        );
        expect(chatRequests.at(-1)?.[0]).toEqual({
            type: 'chat:ask',
            question: 'Where is the answer?',
        });
    });
});
