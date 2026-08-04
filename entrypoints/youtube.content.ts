import { defineContentScript } from 'wxt/utils/define-content-script';
import { videoContextSchema, type VideoContext } from '../src/domain/schemas';
import {
    contentRequestSchema,
    sendRuntimeMessage,
    type ExtensionEvent,
} from '../src/shared/protocol';
import { mountAssistantLauncher } from '../src/ui/content/launcher';

const LEGACY_HISTORY_KEY = 'youtube-chat-video-history';

export default defineContentScript({
    matches: ['https://www.youtube.com/*', 'https://youtube.com/*'],
    runAt: 'document_idle',
    main() {
        void migrateLegacyHistory();
        let removeLauncher: (() => void) | null = null;
        const syncLauncher = () => {
            if (isSupportedVideoPage() && !removeLauncher) {
                removeLauncher = mountAssistantLauncher(() =>
                    sendRuntimeMessage({ type: 'panel:open' })
                );
            } else if (!isSupportedVideoPage() && removeLauncher) {
                removeLauncher();
                removeLauncher = null;
            }
        };
        syncLauncher();
        chrome.runtime.onMessage.addListener(
            (raw: unknown, _sender, sendResponse) => {
                if (!contentRequestSchema.safeParse(raw).success) return false;
                void extractVideoContext().then(sendResponse);
                return true;
            }
        );

        let previousUrl = location.href;
        const announceNavigation = () => {
            if (location.href === previousUrl) return;
            previousUrl = location.href;
            syncLauncher();
            const event: ExtensionEvent = {
                type: 'context:changed',
                url: previousUrl,
            };
            void chrome.runtime.sendMessage(event).catch(() => undefined);
        };
        window.addEventListener('popstate', announceNavigation);
        document.addEventListener('yt-navigate-finish', announceNavigation);
        new MutationObserver(announceNavigation).observe(
            document.documentElement,
            {
                childList: true,
                subtree: true,
            }
        );
    },
});

function isSupportedVideoPage(): boolean {
    return (
        location.pathname === '/watch' ||
        location.pathname.startsWith('/shorts/') ||
        location.pathname.startsWith('/live/')
    );
}

async function extractVideoContext(): Promise<VideoContext> {
    const { video, title } = await waitForVideo();
    const url = location.href;
    const id = videoIdFrom(url);
    if (!id) throw new Error('The YouTube video ID is unavailable.');
    const transcript = await readTranscript();
    return videoContextSchema.parse({
        id,
        title,
        channel:
            textOf(
                '#owner #channel-name a, ytd-channel-name a, #upload-info #channel-name'
            ) || 'Unknown channel',
        description:
            document.querySelector<HTMLMetaElement>('meta[name="description"]')
                ?.content ||
            textOf('#description-inline-expander, #description') ||
            '',
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
        url,
        transcript,
        transcriptStatus: transcript ? 'available' : 'unavailable',
    });
}

async function waitForVideo(): Promise<{
    video: HTMLVideoElement;
    title: string;
}> {
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const video = document.querySelector('video');
        const title = textOf(
            '#title h1.ytd-watch-metadata yt-formatted-string, h1.ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer'
        );
        if (video instanceof HTMLVideoElement && title) return { video, title };
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error('A playable YouTube video is not available.');
}

async function readTranscript(): Promise<string | null> {
    const existing = transcriptText();
    if (existing) return existing;
    const button = [
        ...document.querySelectorAll<HTMLButtonElement>('button'),
    ].find((candidate) => {
        const label = `${candidate.getAttribute('aria-label') ?? ''} ${candidate.textContent ?? ''}`;
        return /show transcript|transcript/i.test(label);
    });
    if (!button) return null;
    button.click();
    for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const value = transcriptText();
        if (value) return value;
    }
    return null;
}

function transcriptText(): string | null {
    const selectors = [
        'ytd-transcript-segment-renderer .segment-text',
        'ytd-transcript-segment-renderer yt-formatted-string',
        '.ytd-transcript-segment-renderer',
    ];
    const segments =
        selectors
            .map((selector) => [
                ...document.querySelectorAll<HTMLElement>(selector),
            ])
            .find((matches) => matches.length > 0) ?? [];
    const text = segments
        .map((segment) => segment.textContent?.trim())
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text || null;
}

function textOf(selector: string): string {
    return (
        document.querySelector<HTMLElement>(selector)?.textContent?.trim() ?? ''
    );
}

function videoIdFrom(url: string): string | null {
    const parsed = new URL(url);
    if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
    const [, kind, id] = parsed.pathname.split('/');
    return kind === 'shorts' || kind === 'live' ? id || null : null;
}

async function migrateLegacyHistory(): Promise<void> {
    const raw = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return;
        const response = (await chrome.runtime.sendMessage({
            type: 'recent:import',
            videos: parsed.slice(-10),
        })) as { ok?: boolean };
        if (response.ok) localStorage.removeItem(LEGACY_HISTORY_KEY);
    } catch {
        // Keep the legacy source intact when parsing or migration fails.
    }
}
