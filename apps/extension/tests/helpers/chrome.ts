import { vi } from 'vitest';

export interface ChromeMemory {
    local: Map<string, unknown>;
    session: Map<string, unknown>;
    sync: Map<string, unknown>;
    reset: () => void;
}

export function installChromeMock(): ChromeMemory {
    const local = new Map<string, unknown>();
    const session = new Map<string, unknown>();
    const sync = new Map<string, unknown>();

    const area = (values: Map<string, unknown>) => ({
        get: vi.fn((keys?: string | string[] | null) => {
            if (keys === undefined || keys === null)
                return Promise.resolve(Object.fromEntries(values));
            const names = typeof keys === 'string' ? [keys] : keys;
            return Promise.resolve(
                Object.fromEntries(
                    names
                        .filter((key) => values.has(key))
                        .map((key) => [key, structuredClone(values.get(key))])
                )
            );
        }),
        set: vi.fn((items: Record<string, unknown>) => {
            for (const [key, value] of Object.entries(items))
                values.set(key, structuredClone(value));
            return Promise.resolve();
        }),
        remove: vi.fn((keys: string | string[]) => {
            for (const key of typeof keys === 'string' ? [keys] : keys)
                values.delete(key);
            return Promise.resolve();
        }),
        clear: vi.fn(() => {
            values.clear();
            return Promise.resolve();
        }),
        setAccessLevel: vi.fn(() => Promise.resolve()),
    });

    vi.stubGlobal('chrome', {
        storage: {
            local: area(local),
            session: area(session),
            sync: area(sync),
        },
    });

    return {
        local,
        session,
        sync,
        reset: () => {
            local.clear();
            session.clear();
            sync.clear();
            vi.clearAllMocks();
        },
    };
}
