import { z } from 'zod';

export const transcriptStatusSchema = z.enum(['available', 'unavailable']);

export const videoContextSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    channel: z.string().default('Unknown channel'),
    description: z.string().default(''),
    duration: z.number().nonnegative(),
    currentTime: z.number().nonnegative(),
    url: z.string().url(),
    transcript: z.string().nullable(),
    transcriptStatus: transcriptStatusSchema,
    comments: z.string().default(''),
    commentsStatus: transcriptStatusSchema.default('unavailable'),
});
export type VideoContext = z.infer<typeof videoContextSchema>;

export const recentVideoSchema = videoContextSchema
    .omit({
        description: true,
        currentTime: true,
        transcript: true,
        transcriptStatus: true,
        comments: true,
        commentsStatus: true,
    })
    .extend({ visitedAt: z.string().datetime() });
export type RecentVideo = z.infer<typeof recentVideoSchema>;

export const appDataSchema = z.object({
    consent: z.object({
        accepted: z.boolean(),
        version: z.number().int().nonnegative(),
        acceptedAt: z.string().datetime().optional(),
    }),
    recentVideos: z.array(recentVideoSchema).max(10),
});
export type AppData = z.infer<typeof appDataSchema>;

export const defaultAppData: AppData = {
    consent: { accepted: false, version: 1 },
    recentVideos: [],
};

export const legacyRecentVideoSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    channel: z.string().default('Unknown channel'),
    url: z.string().url(),
    timestamp: z.number(),
    duration: z.union([z.string(), z.number()]),
});

export const chatAnswerSchema = z.object({ answer: z.string().min(1) });
export type ChatAnswer = z.infer<typeof chatAnswerSchema>;
