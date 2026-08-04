import { describe, expect, it } from 'vitest';
import { buildPrompt } from '../../src/infrastructure/gemini';
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
};

describe('Gemini prompt boundary', () => {
    it('includes every bounded Video Context field and the question', () => {
        const prompt = buildPrompt('What are the key principles?', context);
        expect(prompt).toContain(context.title);
        expect(prompt).toContain(context.channel);
        expect(prompt).toContain(context.description);
        expect(prompt).toContain(context.transcript);
        expect(prompt).toContain('522 seconds');
        expect(prompt).toContain('What are the key principles?');
    });

    it('instructs Gemini not to invent unsupported video claims', () => {
        expect(buildPrompt('Summarize it', context)).toContain(
            'Do not invent quotes, timestamps, or claims'
        );
    });
});
