import { defineBackground } from 'wxt/utils/define-background';
import { AppError, toAppError } from '../src/application/errors';
import {
    askGemini,
    validateGeminiConnection,
} from '../src/infrastructure/gemini';
import { storageRepository } from '../src/infrastructure/storage/chrome-storage';
import { credentialVault } from '../src/infrastructure/storage/credential-vault';
import { videoContextSchema, type VideoContext } from '../src/domain/schemas';
import {
    runtimeRequestSchema,
    type ContentRequest,
    type RuntimeRequest,
    type RuntimeResponse,
} from '../src/shared/protocol';

export default defineBackground(() => {
    const ready = initialize();

    chrome.runtime.onInstalled.addListener(() => void initialize());

    chrome.runtime.onMessage.addListener(
        (
            raw: unknown,
            sender,
            sendResponse: (response: RuntimeResponse) => void
        ) => {
            const parsed = runtimeRequestSchema.safeParse(raw);
            if (!parsed.success) return false;
            if (parsed.data.type === 'panel:open') {
                void openSidePanel(sender)
                    .then((data) => sendResponse({ ok: true, data }))
                    .catch((error: unknown) => {
                        const appError = toAppError(error);
                        sendResponse({
                            ok: false,
                            code: appError.code,
                            message: appError.message,
                        });
                    });
                return true;
            }
            void ready
                .then(() => handleRequest(parsed.data))
                .then((data) => sendResponse({ ok: true, data }))
                .catch((error: unknown) => {
                    const appError = toAppError(error);
                    sendResponse({
                        ok: false,
                        code: appError.code,
                        message: appError.message,
                    });
                });
            return true;
        }
    );
});

async function initialize(): Promise<void> {
    await storageRepository.initialize();
    await chrome.sidePanel.setOptions({
        path: 'sidepanel.html',
        enabled: true,
    });
    try {
        await credentialVault.migrateLegacySyncCredential();
    } catch (error) {
        console.warn(
            'Legacy Gemini credential migration requires attention.',
            error
        );
    }
}

async function openSidePanel(
    sender: chrome.runtime.MessageSender
): Promise<{ opened: true }> {
    const tabId = sender.tab?.id;
    if (typeof tabId !== 'number') {
        throw new AppError(
            'context-unavailable',
            'Open the assistant from a supported YouTube video.'
        );
    }
    await chrome.sidePanel.open({ tabId });
    return { opened: true };
}

async function handleRequest(request: RuntimeRequest): Promise<unknown> {
    switch (request.type) {
        case 'credential:status': {
            const [connected, app] = await Promise.all([
                credentialVault.has(),
                storageRepository.load(),
            ]);
            return { connected, consented: app.consent.accepted };
        }
        case 'credential:save':
            if (request.validate)
                await validateGeminiConnection(request.apiKey);
            await credentialVault.save(request.apiKey);
            await storageRepository.setConsent(request.consented);
            return { connected: true, consented: true };
        case 'credential:remove':
            await credentialVault.remove();
            return { connected: false };
        case 'context:get': {
            const context = await getActiveVideoContext();
            await storageRepository.addRecentVideo(context);
            return context;
        }
        case 'recent:list':
            return (await storageRepository.load()).recentVideos;
        case 'recent:import':
            return (await storageRepository.importLegacyVideos(request.videos))
                .recentVideos;
        case 'chat:ask': {
            const apiKey = await credentialVault.get();
            if (!apiKey) {
                throw new AppError(
                    'credential-missing',
                    'Connect Gemini in the extension popup before asking a question.'
                );
            }
            const context = await getActiveVideoContext();
            await storageRepository.addRecentVideo(context);
            return {
                answer: await askGemini(apiKey, request.question, context),
                context,
            };
        }
    }
}

async function getActiveVideoContext(): Promise<VideoContext> {
    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });
    if (typeof tab?.id !== 'number' || !isSupportedUrl(tab.url)) {
        throw Object.assign(
            new Error('Open a YouTube video to start a conversation.'),
            {
                code: 'context-unavailable',
            }
        );
    }
    const request: ContentRequest = { type: 'content:get-context' };
    try {
        const raw = await chrome.tabs.sendMessage(tab.id, request);
        return videoContextSchema.parse(raw);
    } catch (error) {
        throw Object.assign(
            new Error(
                'YouTube video context is not ready. Reload the video and try again.'
            ),
            {
                code: 'context-unavailable',
                cause: error,
            }
        );
    }
}

function isSupportedUrl(url?: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        if (!['www.youtube.com', 'youtube.com'].includes(parsed.hostname))
            return false;
        return (
            parsed.pathname === '/watch' ||
            parsed.pathname.startsWith('/shorts/') ||
            parsed.pathname.startsWith('/live/')
        );
    } catch {
        return false;
    }
}
