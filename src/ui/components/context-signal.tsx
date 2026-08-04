export function ContextSignal({ available }: { available: boolean }) {
    const heights = [6, 12, 8, 16, 10, 5, 13, 8, 15, 7, 12, 6];
    return (
        <div
            className={
                available
                    ? 'flex items-center gap-2 text-signal'
                    : 'flex items-center gap-2 text-smoke'
            }
        >
            <span
                className="flex h-4 items-center gap-[2px]"
                aria-hidden="true"
            >
                {heights.map((height, index) => (
                    <span
                        key={`${height}-${index}`}
                        className="block w-0.5 rounded-full bg-current"
                        style={{ height }}
                    />
                ))}
            </span>
            <span className="h-px flex-1 bg-current opacity-25" />
            <span className="font-mono text-[8px] font-semibold uppercase tracking-wider">
                {available ? 'Transcript found' : 'Metadata only'}
            </span>
        </div>
    );
}
