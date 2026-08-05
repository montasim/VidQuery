import { beforeEach, describe, expect, it } from 'vitest';
import { ChromeStorageRepository } from '../../src/infrastructure/storage/chrome-storage';
import type { VideoContext } from '../../src/domain/schemas';
import { installChromeMock } from '../helpers/chrome';

const memory = installChromeMock();

function context(index: number): VideoContext {
    return {
        id: `video-${index}`,
        title: `Video ${index}`,
        channel: 'Field Notes',
        description: 'Description',
        duration: 120 + index,
        currentTime: 30,
        url: `https://www.youtube.com/watch?v=video-${index}`,
        transcript: index % 2 ? 'Transcript' : null,
        transcriptStatus: index % 2 ? 'available' : 'unavailable',
        comments: index % 2 ? 'Comment and reply' : '',
        commentsStatus: index % 2 ? 'available' : 'unavailable',
    };
}

describe('local app storage', () => {
    beforeEach(() => memory.reset());

    it('initializes explicit consent and empty recent videos', async () => {
        const repository = new ChromeStorageRepository();
        await expect(repository.initialize()).resolves.toMatchObject({
            consent: { accepted: false, version: 1 },
            recentVideos: [],
        });
    });

    it('retains only ten recent videos without transcripts or conversation data', async () => {
        const repository = new ChromeStorageRepository();
        await repository.initialize();
        for (let index = 0; index < 12; index += 1)
            await repository.addRecentVideo(context(index));
        const app = await repository.load();
        expect(app.recentVideos).toHaveLength(10);
        expect(app.recentVideos[0]?.id).toBe('video-11');
        expect(JSON.stringify(app.recentVideos)).not.toContain('Transcript');
        expect(JSON.stringify(app.recentVideos)).not.toContain('description');
        expect(JSON.stringify(app.recentVideos)).not.toContain('Comment');
    });

    it('imports valid legacy video navigation records', async () => {
        const repository = new ChromeStorageRepository();
        await repository.initialize();
        const app = await repository.importLegacyVideos([
            {
                id: 'legacy',
                title: 'Legacy video',
                channel: 'Archive',
                url: 'https://www.youtube.com/watch?v=legacy',
                timestamp: Date.now(),
                duration: '12:34',
            },
            { broken: true },
        ]);
        expect(app.recentVideos).toHaveLength(1);
        expect(app.recentVideos[0]?.duration).toBe(754);
    });
});
