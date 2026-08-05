import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    askGemini,
    buildPrompt,
    validateGeminiConnection,
} from '../../src/infrastructure/gemini';
import type { VideoContext } from '../../src/domain/schemas';

const context: VideoContext = {
    id: 'video-1',
    title: 'Designing calm interfaces',
    channel: 'Field Notes',
    description: 'A practical interface walkthrough.',
    duration: 1458,
    currentTime: 522,
    url: 'https://www.youtube.com/watch?v=video-1',
    transcript: 'Clarify the primary action. Group by decision.',
    transcriptStatus: 'available',
    comments:
        '[Comment by Ada] The masterclass is at https://example.com/class\n\n[Reply by Sam] Thanks!',
    commentsStatus: 'available',
};

describe('Gemini prompt boundary', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('includes every bounded Video Context field and the question', () => {
        const prompt = buildPrompt('What are the key principles?', context);
        expect(prompt).toContain(context.title);
        expect(prompt).toContain(context.channel);
        expect(prompt).toContain(context.description);
        expect(prompt).toContain(context.transcript);
        expect(prompt).toContain(context.comments);
        expect(prompt).toContain('522 seconds');
        expect(prompt).toContain('What are the key principles?');
    });

    it('searches every source and preserves complete requested links', () => {
        const prompt = buildPrompt('Where is the masterclass link?', context);
        expect(prompt).toContain('Search all supplied sources');
        expect(prompt).toContain('comments, and replies');
        expect(prompt).toContain('return complete URLs exactly');
    });

    it('instructs Gemini not to invent unsupported video claims', () => {
        expect(buildPrompt('Summarize it', context)).toContain(
            'Do not invent quotes, timestamps, or claims'
        );
    });

    it('validates generation access instead of only reading model metadata', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    candidates: [{ content: { parts: [{ text: 'OK' }] } }],
                })
            )
        );
        vi.stubGlobal('fetch', fetchMock);

        await validateGeminiConnection('test-api-key');

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('gemini-2.5-flash:generateContent'),
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('turns denied projects into an actionable connection error', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({
                        error: {
                            message:
                                'Your project has been denied access. Please contact support.',
                        },
                    }),
                    { status: 403 }
                )
            )
        );

        await expect(
            askGemini('test-api-key', 'Summarize this.', context)
        ).rejects.toMatchObject({
            code: 'credential-invalid',
            message: expect.stringContaining('another eligible project'),
        });
    });
});
