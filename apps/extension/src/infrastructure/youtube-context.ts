const MAX_DESCRIPTION_CHARACTERS = 30_000;
const MAX_TRANSCRIPT_CHARACTERS = 80_000;
const MAX_COMMENTS_CHARACTERS = 40_000;
const MAX_COMMENT_THREADS = 40;

export type ExtractedVideoSources = {
    description: string;
    transcript: string | null;
    comments: string;
};

export async function extractVideoSources(
    doc: Document = document,
    viewport: Window = window
): Promise<ExtractedVideoSources> {
    const description = await readDescription(doc);
    const [transcript, comments] = await Promise.all([
        readTranscript(doc),
        readComments(doc, viewport),
    ]);
    return { description, transcript, comments };
}

export async function readDescription(doc: Document): Promise<string> {
    const expand = doc.querySelector<HTMLElement>(
        '#description-inline-expander #expand, ytd-text-inline-expander#description-inline-expander #expand, tp-yt-paper-button#expand'
    );
    expand?.click();
    if (expand) await delay(100);

    const selectors = [
        '#description-inline-expander #description-text',
        '#description-inline-expander yt-attributed-string',
        '#description yt-formatted-string',
        'ytd-text-inline-expander#description-inline-expander',
        '#description-inline-expander',
        '#description',
    ];
    for (const selector of selectors) {
        const element = doc.querySelector<HTMLElement>(selector);
        const text = element ? richTextOf(element) : '';
        if (text) return truncate(text, MAX_DESCRIPTION_CHARACTERS);
    }

    return truncate(
        doc.querySelector<HTMLMetaElement>('meta[name="description"]')
            ?.content ?? '',
        MAX_DESCRIPTION_CHARACTERS
    );
}

export async function readTranscript(doc: Document): Promise<string | null> {
    const existing = transcriptText(doc);
    if (existing) return existing;

    const explicit = doc.querySelector<HTMLElement>(
        'ytd-video-description-transcript-section-renderer button, [target-id="engagement-panel-searchable-transcript"], button[aria-label*="transcript" i]'
    );
    const fallback = [...doc.querySelectorAll<HTMLElement>('button')].find(
        (candidate) =>
            /show transcript|view transcript|transcript/i.test(
                `${candidate.getAttribute('aria-label') ?? ''} ${candidate.textContent ?? ''}`
            )
    );
    (explicit ?? fallback)?.click();
    if (!explicit && !fallback) return null;

    for (let attempt = 0; attempt < 16; attempt += 1) {
        await delay(250);
        const value = transcriptText(doc);
        if (value) return value;
    }
    return null;
}

export function transcriptText(doc: Document): string | null {
    const segments = [
        ...doc.querySelectorAll<HTMLElement>('ytd-transcript-segment-renderer'),
    ];
    if (segments.length > 0) {
        const text = segments
            .map((segment) => {
                const timestamp = textOf(
                    segment,
                    '.segment-timestamp, [class*="timestamp"]'
                );
                const content = textOf(
                    segment,
                    '.segment-text, yt-formatted-string'
                );
                return content
                    ? `${timestamp ? `[${timestamp}] ` : ''}${content}`
                    : '';
            })
            .filter(Boolean)
            .join('\n');
        return text ? truncate(text, MAX_TRANSCRIPT_CHARACTERS) : null;
    }

    const fallback = [
        ...doc.querySelectorAll<HTMLElement>(
            '.ytd-transcript-segment-renderer'
        ),
    ]
        .map((segment) => normalizeText(segment.textContent ?? ''))
        .filter(Boolean)
        .join('\n');
    return fallback ? truncate(fallback, MAX_TRANSCRIPT_CHARACTERS) : null;
}

export async function readComments(
    doc: Document,
    viewport: Window = window
): Promise<string> {
    const commentsRoot = doc.querySelector<HTMLElement>(
        'ytd-comments#comments, ytd-comments, #comments'
    );
    if (!commentsRoot) return '';

    let threads = commentThreads(doc);
    if (threads.length === 0) {
        const originalX = viewport.scrollX;
        const originalY = viewport.scrollY;
        commentsRoot.scrollIntoView?.({ block: 'start' });
        for (let attempt = 0; attempt < 8; attempt += 1) {
            await delay(250);
            threads = commentThreads(doc);
            if (threads.length > 0) break;
        }
        viewport.scrollTo?.(originalX, originalY);
    }

    const selectedThreads = threads.slice(0, MAX_COMMENT_THREADS);
    const replyExpanders = selectedThreads
        .map((thread) => findReplyExpander(thread))
        .filter((element): element is HTMLElement => Boolean(element));
    replyExpanders.forEach((element) => element.click());
    if (replyExpanders.length > 0) await delay(750);

    const entries: string[] = [];
    const seen = new Set<string>();
    for (const thread of selectedThreads) {
        const topLevel =
            thread.querySelector<HTMLElement>(
                ':scope > #comment ytd-comment-view-model, :scope > #comment ytd-comment-renderer, :scope > #comment'
            ) ?? thread;
        addComment(entries, seen, topLevel, 'Comment');
        const replies = thread.querySelectorAll<HTMLElement>(
            '#replies ytd-comment-view-model, #replies ytd-comment-renderer'
        );
        replies.forEach((reply) => addComment(entries, seen, reply, 'Reply'));
    }

    return truncate(entries.join('\n\n'), MAX_COMMENTS_CHARACTERS);
}

export function richTextOf(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;
    const sourceLinks = [...element.querySelectorAll<HTMLAnchorElement>('a')];
    const clonedLinks = [...clone.querySelectorAll<HTMLAnchorElement>('a')];
    clonedLinks.forEach((link, index) => {
        const label = normalizeText(link.textContent ?? '');
        const destination = readableUrl(sourceLinks[index]);
        const rendered =
            destination && !label.includes(destination)
                ? `${label || 'Link'} (${destination})`
                : label || destination;
        link.replaceWith(docTextNode(clone, rendered));
    });
    clone
        .querySelectorAll('br')
        .forEach((breakElement) =>
            breakElement.replaceWith(docTextNode(clone, '\n'))
        );
    clone
        .querySelectorAll('p, li, div')
        .forEach((block) => block.append(docTextNode(clone, '\n')));
    return normalizeText(clone.textContent ?? '');
}

function commentThreads(doc: Document): HTMLElement[] {
    return [
        ...doc.querySelectorAll<HTMLElement>('ytd-comment-thread-renderer'),
    ];
}

function findReplyExpander(thread: HTMLElement): HTMLElement | null {
    const explicit = thread.querySelector<HTMLElement>(
        '#replies #more-replies button, #replies ytd-button-renderer#more-replies button, #more-replies'
    );
    if (explicit) return explicit;
    return (
        [...thread.querySelectorAll<HTMLElement>('#replies button')].find(
            (button) =>
                /repl/i.test(
                    `${button.getAttribute('aria-label') ?? ''} ${button.textContent ?? ''}`
                ) &&
                /view|show|more|read/i.test(
                    `${button.getAttribute('aria-label') ?? ''} ${button.textContent ?? ''}`
                )
        ) ?? null
    );
}

function addComment(
    entries: string[],
    seen: Set<string>,
    root: HTMLElement,
    kind: 'Comment' | 'Reply'
): void {
    const content = root.querySelector<HTMLElement>(
        '#content-text, yt-attributed-string#content-text'
    );
    const body = content ? richTextOf(content) : '';
    if (!body) return;
    const author =
        textOf(root, '#author-text, #author-text span, a#author-text') ||
        'Unknown author';
    const key = `${author}\n${body}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(`[${kind} by ${author}] ${body}`);
}

function readableUrl(anchor?: HTMLAnchorElement): string {
    const value = anchor?.getAttribute('href');
    if (!value || value.startsWith('javascript:')) return '';
    try {
        const url = new URL(value, anchor?.ownerDocument.location.href);
        if (
            url.hostname.endsWith('youtube.com') &&
            url.pathname === '/redirect'
        )
            return url.searchParams.get('q') ?? url.href;
        return url.href;
    } catch {
        return value;
    }
}

function docTextNode(element: HTMLElement, value: string): Text {
    return element.ownerDocument.createTextNode(value);
}

function textOf(root: ParentNode, selector: string): string {
    return normalizeText(
        root.querySelector<HTMLElement>(selector)?.textContent ?? ''
    );
}

function normalizeText(value: string): string {
    return value
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function truncate(value: string, limit: number): string {
    if (value.length <= limit) return value;
    return `${value.slice(0, limit).trimEnd()}\n[Context truncated at ${limit.toLocaleString()} characters]`;
}

function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
