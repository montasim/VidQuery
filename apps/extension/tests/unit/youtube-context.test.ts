import { beforeEach, describe, expect, it } from 'vitest';
import {
    readComments,
    readDescription,
    transcriptText,
} from '../../src/infrastructure/youtube-context';

describe('YouTube context extraction', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
    });

    it('prefers the full rendered description and preserves link destinations', async () => {
        document.head.innerHTML =
            '<meta name="description" content="Truncated preview http...">';
        document.body.innerHTML = `
            <div id="description-inline-expander">
                <div id="description-text">
                    Join the masterclass at
                    <a href="https://www.youtube.com/redirect?q=https%3A%2F%2Fexample.com%2Fmasterclass">http...</a>
                </div>
            </div>
        `;

        const description = await readDescription(document);

        expect(description).toContain('Join the masterclass');
        expect(description).toContain('https://example.com/masterclass');
        expect(description).not.toBe('Truncated preview http...');
    });

    it('collects timestamped transcript segments', () => {
        document.body.innerHTML = `
            <ytd-transcript-segment-renderer>
                <span class="segment-timestamp">1:03</span>
                <span class="segment-text">The masterclass link is in the description.</span>
            </ytd-transcript-segment-renderer>
        `;

        expect(transcriptText(document)).toBe(
            '[1:03] The masterclass link is in the description.'
        );
    });

    it('collects top-level comments, replies, authors, and links', async () => {
        document.body.innerHTML = `
            <ytd-comments id="comments">
                <ytd-comment-thread-renderer>
                    <div id="comment">
                        <a id="author-text">Apu</a>
                        <div id="content-text">Details are in the pinned comment.</div>
                    </div>
                    <div id="replies">
                        <ytd-comment-view-model>
                            <a id="author-text">Abu Lahya</a>
                            <div id="content-text">
                                Enroll at <a href="https://example.com/enroll">this link</a>
                            </div>
                        </ytd-comment-view-model>
                    </div>
                </ytd-comment-thread-renderer>
            </ytd-comments>
        `;

        const comments = await readComments(document, window);

        expect(comments).toContain(
            '[Comment by Apu] Details are in the pinned comment.'
        );
        expect(comments).toContain('[Reply by Abu Lahya]');
        expect(comments).toContain('https://example.com/enroll');
    });
});
