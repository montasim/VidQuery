import { cn } from '#/lib/utils'

const heights = [7, 16, 10, 19, 12, 6, 15, 9]

export function ContextWave({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'context-wave flex h-5 items-center gap-[3px]',
                className,
            )}
            aria-hidden="true"
        >
            {heights.map((height, index) => (
                <span
                    key={`${height}-${index}`}
                    style={
                        {
                            height,
                            '--bar': index,
                        } as React.CSSProperties
                    }
                />
            ))}
        </span>
    )
}
