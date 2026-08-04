import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from 'react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowUp,
    Clock3,
    ExternalLink,
    History,
    KeyRound,
    LoaderCircle,
    Pencil,
    RefreshCw,
    RotateCcw,
    X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { RecentVideo, VideoContext } from '../../domain/schemas';
import {
    extensionEventSchema,
    sendRuntimeMessage,
    type CredentialStatus,
} from '../../shared/protocol';
import { Brand } from '../components/brand';
import { Button } from '../components/button';
import { ContextSignal } from '../components/context-signal';
import { SupportLink } from '../components/support-link';

type View = 'conversation' | 'recent';
type Message = { id: string; role: 'user' | 'assistant'; text: string };

export function SidePanelApp() {
    const [view, setView] = useState<View>('conversation');
    const [credential, setCredential] = useState<CredentialStatus | null>(null);
    const [context, setContext] = useState<VideoContext | null>(null);
    const [contextError, setContextError] = useState<string | null>(null);
    const [loadingContext, setLoadingContext] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState('');
    const [asking, setAsking] = useState(false);
    const [askError, setAskError] = useState<string | null>(null);
    const [askErrorCode, setAskErrorCode] = useState<string | null>(null);
    const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const contextIdRef = useRef<string | null>(null);

    const loadCredential = useCallback(async () => {
        const next = await sendRuntimeMessage<CredentialStatus>({
            type: 'credential:status',
        });
        setCredential(next);
    }, []);

    const loadContext = useCallback(async () => {
        setLoadingContext(true);
        setContextError(null);
        try {
            const next = await sendRuntimeMessage<VideoContext>({
                type: 'context:get',
            });
            if (contextIdRef.current && contextIdRef.current !== next.id)
                setMessages([]);
            contextIdRef.current = next.id;
            setContext(next);
        } catch (error) {
            setContext(null);
            setContextError(
                error instanceof Error
                    ? error.message
                    : 'Video context is unavailable.'
            );
        } finally {
            setLoadingContext(false);
        }
    }, []);

    const loadRecent = useCallback(async () => {
        setRecentVideos(
            await sendRuntimeMessage<RecentVideo[]>({ type: 'recent:list' })
        );
    }, []);

    useEffect(() => {
        void Promise.all([loadCredential(), loadContext(), loadRecent()]);
        const runtimeListener = (raw: unknown) => {
            if (extensionEventSchema.safeParse(raw).success) void loadContext();
        };
        const activatedListener = () => void loadContext();
        const updatedListener: Parameters<
            typeof chrome.tabs.onUpdated.addListener
        >[0] = (_tabId, change, tab) => {
            if (tab.active && (change.url || change.status === 'complete'))
                void loadContext();
        };
        chrome.runtime.onMessage.addListener(runtimeListener);
        chrome.tabs.onActivated.addListener(activatedListener);
        chrome.tabs.onUpdated.addListener(updatedListener);
        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
            chrome.tabs.onActivated.removeListener(activatedListener);
            chrome.tabs.onUpdated.removeListener(updatedListener);
        };
    }, [loadContext, loadCredential, loadRecent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, asking]);

    const ask = async (question: string, appendUser = true) => {
        const clean = question.trim();
        if (!clean || asking) return;
        if (appendUser) {
            setMessages((current) => [
                ...current,
                { id: crypto.randomUUID(), role: 'user', text: clean },
            ]);
        }
        setDraft('');
        setAsking(true);
        setAskError(null);
        setAskErrorCode(null);
        try {
            const result = await sendRuntimeMessage<{
                answer: string;
                context: VideoContext;
            }>({
                type: 'chat:ask',
                question: clean,
            });
            setContext(result.context);
            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    text: result.answer,
                },
            ]);
            void loadRecent();
        } catch (error) {
            setAskErrorCode(
                error instanceof Error && 'code' in error
                    ? String(error.code)
                    : null
            );
            setAskError(
                error instanceof Error
                    ? error.message
                    : 'The question could not be completed.'
            );
        } finally {
            setAsking(false);
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        void ask(draft);
    };

    const editMessage = (message: Message) => {
        const index = messages.findIndex(
            (candidate) => candidate.id === message.id
        );
        setMessages((current) => current.slice(0, Math.max(0, index)));
        setDraft(message.text);
    };

    const retry = () => {
        const lastQuestion = [...messages]
            .reverse()
            .find((message) => message.role === 'user');
        if (!lastQuestion) return;
        setMessages((current) => {
            const lastAssistant = current.findLastIndex(
                (message) => message.role === 'assistant'
            );
            return lastAssistant >= 0
                ? current.slice(0, lastAssistant)
                : current;
        });
        void ask(lastQuestion.text, false);
    };

    const openConnectionSetup = async () => {
        try {
            await chrome.action.openPopup();
        } catch {
            await chrome.tabs.create({
                url: chrome.runtime.getURL('popup.html'),
            });
        }
    };

    const closePanel = async () => {
        await chrome.sidePanel.close({
            windowId: chrome.windows.WINDOW_ID_CURRENT,
        });
    };

    return (
        <main className="flex min-h-screen flex-col bg-paper text-graphite">
            <header className="sticky top-0 z-20 border-b border-line bg-paper/95 px-4 pb-3 pt-4 backdrop-blur-xl">
                <div className="flex items-center">
                    {view === 'recent' ? (
                        <Button
                            variant="outline"
                            size="icon"
                            className="mr-3"
                            onClick={() => setView('conversation')}
                            aria-label="Back to conversation"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Brand compact />
                    )}
                    {view === 'recent' ? (
                        <div>
                            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-smoke">
                                Stored on this device
                            </p>
                            <h1 className="mt-0.5 font-display text-base font-extrabold tracking-[-0.03em]">
                                Recent videos
                            </h1>
                        </div>
                    ) : null}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => {
                            setView(
                                view === 'recent' ? 'conversation' : 'recent'
                            );
                            if (view !== 'recent') void loadRecent();
                        }}
                        aria-label={
                            view === 'recent'
                                ? 'Show conversation'
                                : 'Show recent videos'
                        }
                    >
                        {view === 'recent' ? (
                            <ArrowLeft className="h-4 w-4" />
                        ) : (
                            <History className="h-4 w-4" />
                        )}
                    </Button>
                    <SupportLink compact />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1"
                        onClick={() => void closePanel()}
                        aria-label="Close assistant"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {view === 'recent' ? (
                <RecentVideos
                    videos={recentVideos}
                    onOpen={() => setView('conversation')}
                />
            ) : credential && !credential.connected ? (
                <EmptyState
                    icon={<KeyRound className="h-5 w-5" />}
                    title="Connect Gemini first"
                    body="Use the extension popup to add your API key and confirm AI processing before starting a conversation."
                >
                    <Button onClick={() => void openConnectionSetup()}>
                        <KeyRound className="h-4 w-4" />
                        Open connection setup
                    </Button>
                </EmptyState>
            ) : loadingContext ? (
                <EmptyState
                    icon={<LoaderCircle className="h-5 w-5 animate-spin" />}
                    title="Reading this page"
                    body="Collecting the current video title, playback position, and available transcript."
                />
            ) : contextError || !context ? (
                <EmptyState
                    icon={<AlertCircle className="h-5 w-5" />}
                    title="Open a YouTube video"
                    body={
                        contextError ||
                        'A supported video is required before a conversation can begin.'
                    }
                >
                    <Button
                        variant="outline"
                        onClick={() => void loadContext()}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Check again
                    </Button>
                </EmptyState>
            ) : (
                <>
                    <ContextHeader context={context} />
                    <section className="flex flex-1 flex-col bg-porcelain">
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                            {messages.length === 0 ? (
                                <WelcomeState context={context} />
                            ) : null}
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    onEdit={() => editMessage(message)}
                                />
                            ))}
                            {asking ? <Thinking /> : null}
                            {askError ? (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] leading-relaxed text-red-700"
                                >
                                    <strong className="block">
                                        Question not completed
                                    </strong>
                                    <span className="mt-1 block">
                                        {askError}
                                    </span>
                                    {askErrorCode === 'credential-invalid' ? (
                                        <Button
                                            variant="outline"
                                            size="small"
                                            className="mt-3 bg-white"
                                            onClick={() =>
                                                void openConnectionSetup()
                                            }
                                        >
                                            <KeyRound className="h-3.5 w-3.5" />
                                            Update Gemini key
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="small"
                                            className="mt-3 bg-white"
                                            onClick={retry}
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Try again
                                        </Button>
                                    )}
                                </div>
                            ) : null}
                            <div ref={messagesEndRef} />
                        </div>
                        <form
                            className="sticky bottom-0 border-t border-line bg-paper p-3.5"
                            onSubmit={submit}
                        >
                            <div className="flex items-end gap-2 rounded-xl border border-[#cac9c4] bg-white p-1.5 pl-3 focus-within:border-graphite focus-within:ring-2 focus-within:ring-graphite/5">
                                <textarea
                                    value={draft}
                                    onChange={(event) =>
                                        setDraft(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' &&
                                            !event.shiftKey
                                        ) {
                                            event.preventDefault();
                                            event.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    rows={1}
                                    maxLength={500}
                                    placeholder="Ask about this video…"
                                    className="max-h-28 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-[13px] leading-5 outline-none placeholder:text-[#92928c]"
                                />
                                <Button
                                    size="icon"
                                    className="rounded-lg"
                                    disabled={!draft.trim() || asking}
                                    aria-label="Send question"
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="mt-2 text-center text-[9px] leading-relaxed text-smoke">
                                Video context goes directly to Gemini only when
                                you ask.
                            </p>
                        </form>
                    </section>
                </>
            )}
        </main>
    );
}

function ContextHeader({ context }: { context: VideoContext }) {
    return (
        <section className="border-b border-line bg-paper px-4 py-3">
            <div className="rounded-xl border border-line bg-porcelain p-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold">
                            {context.title}
                        </p>
                        <p className="mt-1 truncate text-[9px] text-smoke">
                            {context.channel}
                        </p>
                    </div>
                    <span className="shrink-0 font-mono text-[9px] font-semibold text-smoke">
                        {formatDuration(context.currentTime)} /{' '}
                        {formatDuration(context.duration)}
                    </span>
                </div>
                <div className="mt-2">
                    <ContextSignal
                        available={context.transcriptStatus === 'available'}
                    />
                </div>
            </div>
        </section>
    );
}

function WelcomeState({ context }: { context: VideoContext }) {
    return (
        <div className="my-auto px-4 py-10 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-graphite text-white">
                <ArrowUp className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-extrabold tracking-[-0.03em]">
                Ask what the video explains
            </h2>
            <p className="mx-auto mt-2 max-w-72 text-[12px] leading-relaxed text-smoke">
                Questions use “{context.title}” and{' '}
                {context.transcript
                    ? 'its available transcript'
                    : 'the available video metadata'}{' '}
                as context.
            </p>
        </div>
    );
}

function MessageBubble({
    message,
    onEdit,
}: {
    message: Message;
    onEdit: () => void;
}) {
    if (message.role === 'user') {
        return (
            <div className="max-w-[88%] self-end">
                <div className="rounded-2xl rounded-br-md bg-graphite px-4 py-3 text-[13px] leading-relaxed text-white">
                    {message.text}
                </div>
                <button
                    onClick={onEdit}
                    className="mt-1.5 flex items-center gap-1 px-1 text-[10px] font-semibold text-smoke hover:text-graphite"
                >
                    <Pencil className="h-3 w-3" />
                    Edit
                </button>
            </div>
        );
    }
    return (
        <div className="max-w-[94%] self-start">
            <div className="rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 text-[13px] leading-[1.55] text-carbon">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ children }) => (
                            <h3 className="mb-2 mt-3 font-display text-sm font-extrabold first:mt-0">
                                {children}
                            </h3>
                        ),
                        h2: ({ children }) => (
                            <h3 className="mb-2 mt-3 font-display text-sm font-extrabold first:mt-0">
                                {children}
                            </h3>
                        ),
                        h3: ({ children }) => (
                            <h3 className="mb-2 mt-3 font-display text-sm font-extrabold first:mt-0">
                                {children}
                            </h3>
                        ),
                        p: ({ children }) => (
                            <p className="my-2 first:mt-0 last:mb-0">
                                {children}
                            </p>
                        ),
                        ul: ({ children }) => (
                            <ul className="my-2 list-disc space-y-1 pl-5">
                                {children}
                            </ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="my-2 list-decimal space-y-1 pl-5">
                                {children}
                            </ol>
                        ),
                        code: ({ children }) => (
                            <code className="rounded bg-mist px-1 py-0.5 font-mono text-[11px]">
                                {children}
                            </code>
                        ),
                        a: ({ children, ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-signal underline-offset-2 hover:underline"
                            >
                                {children}
                            </a>
                        ),
                    }}
                >
                    {message.text}
                </ReactMarkdown>
            </div>
        </div>
    );
}

function Thinking() {
    return (
        <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 text-smoke">
            <span className="h-1.5 w-1.5 animate-[context-pulse_1.2s_ease-in-out_infinite] rounded-full bg-signal" />
            <span className="h-1.5 w-1.5 animate-[context-pulse_1.2s_ease-in-out_120ms_infinite] rounded-full bg-signal" />
            <span className="h-1.5 w-1.5 animate-[context-pulse_1.2s_ease-in-out_240ms_infinite] rounded-full bg-signal" />
            <span className="ml-1 text-[11px] font-semibold">
                Reviewing video context
            </span>
        </div>
    );
}

function RecentVideos({
    videos,
    onOpen,
}: {
    videos: RecentVideo[];
    onOpen: () => void;
}) {
    if (videos.length === 0)
        return (
            <EmptyState
                icon={<Clock3 className="h-5 w-5" />}
                title="No recent videos yet"
                body="Open the assistant on a YouTube video and it will appear here."
            />
        );
    return (
        <section className="divide-y divide-line">
            {videos.map((video) => (
                <article
                    key={video.id}
                    className="flex gap-3 p-4 hover:bg-porcelain"
                >
                    <div className="grid h-[68px] w-24 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-carbon to-[#4b596a] font-mono text-[9px] font-semibold text-white/80">
                        {formatDuration(video.duration)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-[13px] font-bold leading-snug">
                            {video.title}
                        </h2>
                        <p className="mt-1 truncate text-[10px] text-smoke">
                            {video.channel} · {formatAge(video.visitedAt)}
                        </p>
                        <button
                            onClick={() => {
                                void chrome.tabs.update({ url: video.url });
                                onOpen();
                            }}
                            className="mt-2 flex items-center gap-1 text-[10px] font-bold text-signal"
                        >
                            Open on YouTube <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                </article>
            ))}
        </section>
    );
}

function EmptyState({
    icon,
    title,
    body,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
    children?: React.ReactNode;
}) {
    return (
        <section className="grid flex-1 place-items-center px-7 py-16 text-center">
            <div>
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-graphite text-white">
                    {icon}
                </span>
                <h2 className="mt-4 font-display text-lg font-extrabold tracking-[-0.03em]">
                    {title}
                </h2>
                <p className="mx-auto mt-2 max-w-72 text-[12px] leading-relaxed text-smoke">
                    {body}
                </p>
                {children ? <div className="mt-5">{children}</div> : null}
            </div>
        </section>
    );
}

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remaining = Math.floor(seconds % 60);
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
        : `${minutes}:${String(remaining).padStart(2, '0')}`;
}

function formatAge(value: string): string {
    const difference = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(difference / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
