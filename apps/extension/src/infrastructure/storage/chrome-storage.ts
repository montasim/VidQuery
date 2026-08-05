import { AppError } from '../../application/errors';
import {
    appDataSchema,
    defaultAppData,
    legacyRecentVideoSchema,
    type AppData,
    type RecentVideo,
    type VideoContext,
} from '../../domain/schemas';

const APP_DATA_KEY = 'youtube-helper.app-data';

export class ChromeStorageRepository {
    async initialize(): Promise<AppData> {
        await chrome.storage.local.setAccessLevel({
            accessLevel: 'TRUSTED_CONTEXTS',
        });
        await chrome.storage.session.setAccessLevel({
            accessLevel: 'TRUSTED_CONTEXTS',
        });
        return this.load();
    }

    async load(): Promise<AppData> {
        const result = await chrome.storage.local.get(APP_DATA_KEY);
        if (result[APP_DATA_KEY] === undefined) {
            await this.save(defaultAppData);
            return structuredClone(defaultAppData);
        }
        const parsed = appDataSchema.safeParse(result[APP_DATA_KEY]);
        if (!parsed.success) {
            throw new AppError(
                'storage-failed',
                'Local extension data could not be read safely.'
            );
        }
        return parsed.data;
    }

    async save(value: AppData): Promise<AppData> {
        const parsed = appDataSchema.safeParse(value);
        if (!parsed.success)
            throw new AppError('storage-failed', 'Local data is invalid.');
        await chrome.storage.local.set({ [APP_DATA_KEY]: parsed.data });
        return parsed.data;
    }

    async setConsent(accepted: boolean): Promise<AppData> {
        const app = await this.load();
        app.consent = accepted
            ? {
                  accepted: true,
                  version: 1,
                  acceptedAt: new Date().toISOString(),
              }
            : { accepted: false, version: 1 };
        return this.save(app);
    }

    async addRecentVideo(context: VideoContext): Promise<AppData> {
        const app = await this.load();
        const next: RecentVideo = {
            id: context.id,
            title: context.title,
            channel: context.channel,
            duration: context.duration,
            url: context.url,
            visitedAt: new Date().toISOString(),
        };
        app.recentVideos = [
            next,
            ...app.recentVideos.filter((item) => item.id !== next.id),
        ].slice(0, 10);
        return this.save(app);
    }

    async importLegacyVideos(values: unknown[]): Promise<AppData> {
        const app = await this.load();
        const migrated = values.flatMap((value) => {
            const parsed = legacyRecentVideoSchema.safeParse(value);
            if (!parsed.success) return [];
            return [
                {
                    id: parsed.data.id,
                    title: parsed.data.title,
                    channel: parsed.data.channel,
                    url: parsed.data.url,
                    duration: parseDuration(parsed.data.duration),
                    visitedAt: new Date(parsed.data.timestamp).toISOString(),
                } satisfies RecentVideo,
            ];
        });
        const byId = new Map(
            [...app.recentVideos, ...migrated].map((video) => [video.id, video])
        );
        app.recentVideos = [...byId.values()]
            .sort((left, right) =>
                right.visitedAt.localeCompare(left.visitedAt)
            )
            .slice(0, 10);
        return this.save(app);
    }
}

function parseDuration(value: string | number): number {
    if (typeof value === 'number') return Math.max(0, value);
    const parts = value.split(':').map(Number);
    if (parts.some(Number.isNaN)) return 0;
    return parts.reduce((total, part) => total * 60 + part, 0);
}

export const storageRepository = new ChromeStorageRepository();
