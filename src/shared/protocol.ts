import { z } from 'zod';
import { videoContextSchema } from '../domain/schemas';
import type { ErrorCode } from '../application/errors';

export const runtimeRequestSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('credential:status') }),
    z.object({
        type: z.literal('credential:save'),
        apiKey: z.string().min(10).max(500),
        validate: z.boolean(),
        consented: z.literal(true),
    }),
    z.object({ type: z.literal('credential:remove') }),
    z.object({ type: z.literal('panel:open') }),
    z.object({ type: z.literal('context:get') }),
    z.object({ type: z.literal('recent:list') }),
    z.object({
        type: z.literal('recent:import'),
        videos: z.array(z.unknown()).max(10),
    }),
    z.object({
        type: z.literal('chat:ask'),
        question: z.string().min(1).max(500),
    }),
]);
export type RuntimeRequest = z.infer<typeof runtimeRequestSchema>;

export const contentRequestSchema = z.object({
    type: z.literal('content:get-context'),
});
export type ContentRequest = z.infer<typeof contentRequestSchema>;

export const extensionEventSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('context:changed'),
        url: z.string(),
    }),
    z.object({
        type: z.literal('context:playback'),
        videoId: z.string().min(1),
        currentTime: z.number().nonnegative(),
        duration: z.number().nonnegative(),
        playing: z.boolean(),
    }),
]);
export type ExtensionEvent = z.infer<typeof extensionEventSchema>;

export type RuntimeResponse<T = unknown> =
    { ok: true; data: T } | { ok: false; code: ErrorCode; message: string };

export type CredentialStatus = { connected: boolean; consented: boolean };

export async function sendRuntimeMessage<T>(
    request: RuntimeRequest
): Promise<T> {
    const response = (await chrome.runtime.sendMessage(
        request
    )) as RuntimeResponse<T>;
    if (!response.ok)
        throw Object.assign(new Error(response.message), {
            code: response.code,
        });
    return response.data;
}

export function isVideoContext(
    value: unknown
): value is z.infer<typeof videoContextSchema> {
    return videoContextSchema.safeParse(value).success;
}
