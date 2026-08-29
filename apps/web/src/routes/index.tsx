import { createFileRoute } from '@tanstack/react-router'
import {
    ArrowRightIcon,
    CaptionsIcon,
    CheckIcon,
    CopyIcon,
    DownloadIcon,
    Code2Icon,
    LinkIcon,
    MessageSquareTextIcon,
    PlayIcon,
    RotateCcwIcon,
    ShieldCheckIcon,
} from 'lucide-react'

import { BrandMark } from '#/components/brand-mark'
import { ContextWave } from '#/components/context-wave'
import { ProductDemo } from '#/components/product-demo'
import { SiteHeader } from '#/components/site-header'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '#/components/ui/accordion'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

const downloadUrl =
    'https://github.com/montasim/VidQuery/releases/latest/download/VidQuery-chrome-unpacked.zip'

const sources = [
    {
        label: 'Description + links',
        title: 'The details under “more”',
        body: 'Full destinations are preserved, even when YouTube shortens the visible URL.',
        icon: LinkIcon,
    },
    {
        label: 'Transcript',
        title: 'What was actually said',
        body: 'Timestamped segments supply the words and your current playback position.',
        icon: CaptionsIcon,
    },
    {
        label: 'Comments + replies',
        title: 'What the conversation adds',
        body: 'Loaded threads can provide corrections, links, and creator follow-ups.',
        icon: MessageSquareTextIcon,
    },
    {
        label: 'Playback',
        title: 'Where you are right now',
        body: 'The context follows the video without repeatedly scraping the page.',
        icon: PlayIcon,
    },
]

const faqs = [
    {
        question: 'Does VidQuery upload every page I open?',
        answer: 'No. It runs only on supported YouTube video pages and sends the collected context directly to Gemini when you submit a question.',
    },
    {
        question: 'Where is my Gemini API key stored?',
        answer: 'Your key is encrypted with a device-bound credential before it is persisted in Chrome storage. The project does not operate an intermediary backend.',
    },
    {
        question: 'Can it answer from comments and replies?',
        answer: 'Yes. VidQuery includes a bounded set of comments and loaded replies alongside the description, full links, transcript, and playback metadata.',
    },
    {
        question: 'Does the GitHub version update automatically?',
        answer: 'Not yet. Download the latest release, extract it into a permanent folder, and load that folder in Chrome. Repeat those steps when you choose to install a newer release.',
    },
]

function Home() {
    return (
        <>
            <SiteHeader />
            <main id="top">
                <section className="hero-section">
                    <div className="hero-glow" aria-hidden="true" />
                    <div className="relative mx-auto grid max-w-[1440px] items-center gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
                        <div className="max-w-[680px]">
                            <div className="mb-7 flex items-center gap-3 text-signal">
                                <ContextWave />
                                <span className="h-px w-10 bg-signal/35" />
                                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                                    Context ready
                                </span>
                            </div>

                            <h1 className="display-tight hero-title">
                                The answer is already in the video.
                                <span className="mt-3 block text-signal">
                                    Ask for it.
                                </span>
                            </h1>

                            <p className="hero-copy mt-7">
                                VidQuery reads the description, transcript,
                                comments, and replies beside YouTube, then
                                grounds Gemini answers in that context.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="download-button">
                                    <a href={downloadUrl}>
                                        Download for Chrome{' '}
                                        <DownloadIcon data-icon="inline-end" />
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-[46px] rounded-2xl border-hairline bg-white px-5 text-sm font-bold hover:-translate-y-px hover:bg-cloud"
                                >
                                    <a href="#demo">See it beside YouTube</a>
                                </Button>
                            </div>

                            <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-steel">
                                Chrome 141+ · Gemini API key required · No
                                account
                            </p>
                        </div>

                        <ProductDemo />
                    </div>
                </section>

                <section className="border-y border-hairline bg-cloud/70 px-5 py-6 sm:px-8 lg:px-12">
                    <div className="mx-auto grid max-w-[1440px] gap-4 text-center sm:grid-cols-3 sm:text-left">
                        {[
                            'No intermediary backend',
                            'Device-bound key encryption',
                            'Context sent only when you ask',
                        ].map((statement) => (
                            <p
                                key={statement}
                                className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-steel"
                            >
                                <CheckIcon className="mr-2 inline size-3 text-signal" />
                                {statement}
                            </p>
                        ))}
                    </div>
                </section>

                <section id="how" className="section-shell">
                    <div className="mx-auto max-w-[1240px]">
                        <div className="max-w-3xl">
                            <p className="eyebrow">What VidQuery can read</p>
                            <h2 className="section-title">
                                One question. Every useful layer around the
                                video.
                            </h2>
                            <p className="section-copy">
                                A video is more than pixels. VidQuery gathers
                                the source material people normally search by
                                hand and gives Gemini a bounded context to
                                answer from.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
                            <div className="source-list">
                                {sources.map(
                                    ({ label, title, body, icon: Icon }) => (
                                        <article
                                            key={label}
                                            className="source-node"
                                        >
                                            <Icon className="mb-3 size-5 text-signal md:hidden" />
                                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-steel">
                                                {label}
                                            </p>
                                            <h3 className="mt-2 text-lg font-bold leading-7">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-steel">
                                                {body}
                                            </p>
                                        </article>
                                    ),
                                )}
                            </div>

                            <div className="self-center rounded-[28px] bg-ink p-7 text-white sm:p-10">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <BrandMark className="size-10 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">
                                                Ask this video
                                            </p>
                                            <p className="mt-0.5 truncate text-xs text-white/50">
                                                7 Halal Ways To Make $100 a Day
                                                in 2026
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 font-mono text-[10px] text-white/50">
                                        1:03 / 16:26
                                    </span>
                                </div>
                                <div className="mt-5 flex items-center gap-3 text-signal">
                                    <ContextWave />
                                    <span className="relative h-px flex-1 bg-white/15">
                                        <span className="absolute inset-y-0 left-0 w-[7%] bg-signal" />
                                        <span className="absolute left-[7%] top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal" />
                                    </span>
                                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                                        Comments found
                                    </span>
                                </div>
                                <div className="mt-9 ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-[#343432] px-4 py-3 text-sm leading-6">
                                    Where is the masterclass link?
                                </div>
                                <div className="mt-4 max-w-[90%] rounded-2xl rounded-bl-md bg-white px-5 py-4 text-sm leading-6 text-ink">
                                    The masterclass link is in the full video
                                    description and the creator’s reply.
                                    VidQuery preserves the complete destination
                                    instead of the shortened “http...” label.
                                </div>
                                <div
                                    className="mt-4 flex justify-end gap-3 text-white/40"
                                    aria-label="Example answer actions"
                                >
                                    <RotateCcwIcon className="size-3.5" />
                                    <CopyIcon className="size-3.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="privacy"
                    className="bg-ink px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-12"
                >
                    <div className="mx-auto max-w-[1240px]">
                        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
                            <div>
                                <p className="eyebrow text-signal">
                                    Privacy by architecture
                                </p>
                                <h2 className="section-title max-w-3xl">
                                    Your question takes the shortest possible
                                    route.
                                </h2>
                            </div>
                            <div className="self-end max-w-[62ch] text-base leading-7 text-white/70">
                                <p>
                                    VidQuery does not operate a relay server.
                                    Your chosen video context moves from the
                                    extension to Gemini only when you ask.
                                </p>
                                <a
                                    href="https://github.com/montasim/VidQuery"
                                    className="mt-7 inline-flex items-center gap-2 font-semibold text-white hover:text-signal"
                                >
                                    Inspect the source{' '}
                                    <ArrowRightIcon className="size-4" />
                                </a>
                            </div>
                        </div>

                        <div className="mt-16 grid border-y border-white/15 md:grid-cols-2">
                            <div className="border-b border-white/15 py-8 md:border-r md:border-b-0 md:pr-10">
                                <ShieldCheckIcon className="size-7 text-signal" />
                                <h3 className="mt-5 text-lg font-bold">
                                    No VidQuery account
                                </h3>
                                <p className="mt-3 max-w-md leading-7 text-white/55">
                                    There is no profile database, analytics
                                    identity, or project-operated backend to
                                    trust.
                                </p>
                            </div>
                            <div className="py-8 md:pl-10">
                                <svg
                                    className="size-7 text-signal"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    aria-hidden="true"
                                >
                                    <path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5z" />
                                </svg>
                                <h3 className="mt-5 text-lg font-bold">
                                    Encrypted key storage
                                </h3>
                                <p className="mt-3 max-w-md leading-7 text-white/55">
                                    Your Gemini credential is encrypted with a
                                    device-bound key before Chrome persists it.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="install" className="section-shell">
                    <div className="mx-auto max-w-[1240px]">
                        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
                            <div>
                                <p className="eyebrow">
                                    Install the current release
                                </p>
                                <h2 className="section-title">
                                    Three deliberate steps. No store account.
                                </h2>
                                <p className="section-copy">
                                    VidQuery is currently distributed as an
                                    unpacked Chrome extension through GitHub
                                    Releases.
                                </p>
                                <Button
                                    asChild
                                    className="download-button mt-8"
                                >
                                    <a href={downloadUrl}>
                                        Get the latest release{' '}
                                        <DownloadIcon data-icon="inline-end" />
                                    </a>
                                </Button>
                            </div>
                            <ol className="border-t border-hairline">
                                {[
                                    [
                                        'Download and extract',
                                        'Keep the extracted VidQuery folder somewhere permanent.',
                                    ],
                                    [
                                        'Open Chrome extensions',
                                        'Visit chrome://extensions and turn on Developer mode.',
                                    ],
                                    [
                                        'Load unpacked',
                                        'Choose the extracted folder containing manifest.json.',
                                    ],
                                ].map(([title, body], index) => (
                                    <li
                                        key={title}
                                        className="grid gap-4 border-b border-hairline py-7 sm:grid-cols-[72px_1fr]"
                                    >
                                        <span className="font-mono text-xs font-semibold text-signal">
                                            0{index + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold leading-7">
                                                {title}
                                            </h3>
                                            <p className="mt-2 leading-7 text-steel">
                                                {body}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                <section className="border-t border-hairline bg-cloud/60 px-5 py-24 sm:px-8 sm:py-28 lg:px-12">
                    <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.7fr_1fr] lg:gap-24">
                        <div>
                            <p className="eyebrow">Before you install</p>
                            <h2 className="section-title">
                                Questions worth asking.
                            </h2>
                        </div>
                        <Accordion
                            type="single"
                            collapsible
                            className="border-t border-hairline"
                        >
                            {faqs.map((item) => (
                                <AccordionItem
                                    key={item.question}
                                    value={item.question}
                                    className="border-hairline"
                                >
                                    <AccordionTrigger className="rounded-none py-6 text-base font-bold hover:no-underline">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="max-w-2xl pb-6 leading-7 text-steel">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                <section className="bg-[#eef1f2] px-5 py-20 text-ink sm:px-8 lg:px-12">
                    <div className="mx-auto flex max-w-[1240px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                                Context ready
                            </p>
                            <h2 className="section-title !mt-4 max-w-4xl">
                                Stop hunting through the page. Ask the video.
                            </h2>
                        </div>
                        <Button
                            asChild
                            className="h-[46px] shrink-0 rounded-2xl bg-ink px-5 text-sm font-bold !text-white hover:bg-[#111315]"
                        >
                            <a href={downloadUrl}>Download for Chrome</a>
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="bg-ink px-5 py-8 text-white sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-[1240px] flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5 font-display font-bold">
                        <BrandMark className="size-7" /> VidQuery
                    </div>
                    <p className="text-white/65">
                        A private-by-default Gemini companion for YouTube.
                    </p>
                    <a
                        href="https://github.com/montasim/VidQuery"
                        className="inline-flex items-center gap-2 font-semibold hover:text-signal"
                    >
                        <Code2Icon className="size-4" /> GitHub
                    </a>
                </div>
            </footer>
        </>
    )
}
