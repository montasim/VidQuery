import { MessageSquareText } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={`${compact ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-[14px]'} grid shrink-0 place-items-center bg-graphite text-white`}
            >
                <MessageSquareText
                    className={compact ? 'h-4 w-4' : 'h-5 w-5'}
                    strokeWidth={1.8}
                />
            </span>
            <div className="min-w-0">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-smoke">
                    YouTube Helper
                </p>
                <p className="mt-0.5 truncate font-display text-sm font-extrabold tracking-[-0.03em]">
                    Ask this video
                </p>
            </div>
        </div>
    );
}
