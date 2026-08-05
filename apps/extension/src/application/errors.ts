export type ErrorCode =
    | 'credential-invalid'
    | 'credential-missing'
    | 'context-unavailable'
    | 'provider-error'
    | 'quota-exceeded'
    | 'network-error'
    | 'storage-failed';

export class AppError extends Error {
    constructor(
        readonly code: ErrorCode,
        message: string,
        override readonly cause?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error)
        return new AppError('provider-error', error.message, error);
    return new AppError(
        'provider-error',
        'An unexpected extension error occurred.',
        error
    );
}
