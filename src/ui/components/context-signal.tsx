export function ContextSignal({
    transcriptAvailable,
    commentsAvailable,
    progress,
    active,
}: {
    transcriptAvailable: boolean;
    commentsAvailable: boolean;
    progress: number;
    active: boolean;
}) {
    const available = transcriptAvailable || commentsAvailable;
    const label = [
        transcriptAvailable ? 'Transcript' : '',
        commentsAvailable ? 'Comments' : '',
    ]
        .filter(Boolean)
        .join(' + ');
    const boundedProgress = Math.min(1, Math.max(0, progress));
    const heights = [6, 12, 8, 16, 10, 5, 13, 8, 15, 7, 12, 6];
    return (
        <div
            className={`context-signal flex items-center gap-2 ${available ? 'text-signal' : 'text-smoke'} ${active ? 'is-playing' : ''}`}
            aria-label={`${label || 'Description and metadata'} available. ${Math.round(boundedProgress * 100)}% played. Video ${active ? 'playing' : 'paused'}.`}
        >
            <span
                className="flex h-4 items-center gap-[2px]"
                aria-hidden="true"
            >
                {heights.map((height, index) => (
                    <span
                        key={`${height}-${index}`}
                        className="context-wave-bar block w-0.5 origin-center rounded-full bg-current"
                        style={{
                            height,
                            animationDelay: `${index * -70}ms`,
                        }}
                    />
                ))}
            </span>
            <span className="relative h-px flex-1 overflow-visible bg-current/20">
                <span
                    className="context-progress absolute inset-y-0 left-0 bg-current"
                    style={{ width: `${boundedProgress * 100}%` }}
                />
                <span
                    className="context-playhead absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
                    style={{ left: `${boundedProgress * 100}%` }}
                />
            </span>
            <span className="context-source-label font-mono text-[8px] font-semibold uppercase tracking-wider">
                {available ? `${label} found` : 'Description + metadata'}
            </span>
        </div>
    );
}
