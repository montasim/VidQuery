import { useEffect, useState, type FormEvent } from 'react';
import {
    Check,
    ExternalLink,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    PanelRightOpen,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { Brand } from '../components/brand';
import { Button } from '../components/button';
import { SupportLink } from '../components/support-link';
import {
    sendRuntimeMessage,
    type CredentialStatus,
} from '../../shared/protocol';

type SaveMode = 'validate' | 'skip' | null;

export function PopupApp() {
    const [status, setStatus] = useState<CredentialStatus | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [consented, setConsented] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState<SaveMode>(null);
    const [message, setMessage] = useState<{
        kind: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        void sendRuntimeMessage<CredentialStatus>({ type: 'credential:status' })
            .then((next) => {
                setStatus(next);
                setConsented(next.consented);
            })
            .catch((error: Error) =>
                setMessage({ kind: 'error', text: error.message })
            );
    }, []);

    const save = async (event: FormEvent, validate: boolean) => {
        event.preventDefault();
        if (!consented) {
            setMessage({
                kind: 'error',
                text: 'Confirm AI processing before connecting Gemini.',
            });
            return;
        }
        setSaving(validate ? 'validate' : 'skip');
        setMessage(null);
        try {
            const next = await sendRuntimeMessage<CredentialStatus>({
                type: 'credential:save',
                apiKey,
                validate,
                consented: true,
            });
            setStatus(next);
            setApiKey('');
            setEditing(false);
            setMessage({
                kind: 'success',
                text: validate
                    ? 'Gemini connected and ready.'
                    : 'Gemini key saved. Validate it by asking a video question.',
            });
        } catch (error) {
            setMessage({
                kind: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'Gemini could not be connected.',
            });
        } finally {
            setSaving(null);
        }
    };

    const remove = async () => {
        await sendRuntimeMessage({ type: 'credential:remove' });
        setStatus({ connected: false, consented: Boolean(status?.consented) });
        setEditing(true);
        setMessage({
            kind: 'success',
            text: 'Gemini connection removed from this device.',
        });
    };

    const openAssistant = async () => {
        await chrome.sidePanel.open({
            windowId: chrome.windows.WINDOW_ID_CURRENT,
        });
        window.close();
    };

    const connected = status?.connected && !editing;

    return (
        <main className="w-[380px] bg-paper text-graphite">
            <header className="border-b border-line px-6 pb-5 pt-6">
                <div className="flex items-center justify-between gap-4">
                    <Brand />
                    <SupportLink />
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-smoke">
                    Connect your own Gemini key, then ask questions grounded in
                    the video you are watching.
                </p>
            </header>

            {status === null ? (
                <div className="grid min-h-56 place-items-center text-smoke">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                </div>
            ) : connected ? (
                <section className="motion-surface space-y-4 p-6">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-success text-white">
                                <Check className="h-4 w-4" />
                            </span>
                            <div>
                                <h1 className="text-sm font-bold">
                                    Gemini is connected
                                </h1>
                                <p className="mt-1 text-[11px] leading-relaxed text-smoke">
                                    Your encrypted key stays bound to this
                                    browser profile.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => void openAssistant()}
                    >
                        <PanelRightOpen className="h-4 w-4" />
                        Open assistant
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setEditing(true)}
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                            Replace key
                        </Button>
                        <Button
                            variant="danger"
                            size="small"
                            onClick={() => void remove()}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                        </Button>
                    </div>
                </section>
            ) : (
                <form
                    className="motion-surface space-y-4 p-6"
                    onSubmit={(event) => void save(event, true)}
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="api-key"
                                className="text-xs font-bold"
                            >
                                Gemini API key
                            </label>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-signal hover:underline"
                            >
                                Get a free-tier key{' '}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <div className="relative mt-2">
                            <input
                                id="api-key"
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(event) =>
                                    setApiKey(event.target.value)
                                }
                                placeholder="Paste your API key"
                                autoComplete="off"
                                className="h-11 w-full rounded-xl border border-[#cac9c4] bg-porcelain px-3 pr-11 font-mono text-[11px] outline-none transition-[background-color,border-color,box-shadow] duration-200 focus:border-graphite focus:bg-white focus:shadow-[0_0_0_3px_rgb(23_23_23_/_0.05)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey((value) => !value)}
                                className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-smoke hover:bg-mist"
                                aria-label={
                                    showKey ? 'Hide API key' : 'Show API key'
                                }
                            >
                                {showKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-porcelain p-3">
                        <input
                            type="checkbox"
                            checked={consented}
                            onChange={(event) =>
                                setConsented(event.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 accent-signal"
                        />
                        <span className="text-[10px] leading-relaxed text-smoke">
                            <strong className="text-graphite">
                                Allow AI processing.
                            </strong>{' '}
                            Your question and this video’s context—including its
                            description, links, available transcript, comments,
                            and replies—go directly to Google Gemini.{' '}
                            <a
                                href="https://ai.google.dev/gemini-api/terms"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-signal hover:underline"
                            >
                                Review terms
                            </a>
                            .
                        </span>
                    </label>
                    <Button
                        className="w-full"
                        disabled={!apiKey.trim() || saving !== null}
                    >
                        {saving === 'validate' ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="h-4 w-4" />
                        )}
                        {saving === 'validate'
                            ? 'Validating…'
                            : 'Save and validate'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={!apiKey.trim() || saving !== null}
                        onClick={(event) => void save(event, false)}
                    >
                        {saving === 'skip' ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : null}
                        {saving === 'skip'
                            ? 'Saving…'
                            : 'Save without validation'}
                    </Button>
                </form>
            )}

            {message ? (
                <div
                    role="status"
                    className={`motion-surface mx-6 mb-5 rounded-xl border p-3 text-[11px] font-semibold leading-relaxed ${message.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-success' : 'border-red-200 bg-red-50 text-red-700'}`}
                >
                    {message.text}
                </div>
            ) : null}
            <footer className="border-t border-line bg-porcelain px-6 py-4">
                <p className="text-[10px] leading-relaxed text-smoke">
                    <strong className="text-graphite">
                        Private by design.
                    </strong>{' '}
                    No intermediary server, account, or saved conversation
                    history.
                </p>
            </footer>
        </main>
    );
}
