import { Heart } from 'lucide-react';
import { Button } from './button';

const SUPPORT_URL = 'https://www.supportkori.com/montasim';

export function SupportLink({ compact = false }: { compact?: boolean }) {
    return (
        <Button
            asChild
            variant={compact ? 'ghost' : 'outline'}
            size={compact ? 'icon' : 'small'}
            className={
                compact
                    ? 'text-[#9f5360] hover:bg-[#fff5f6] hover:text-[#87424e]'
                    : 'text-[#87424e] hover:bg-[#fff5f6]'
            }
        >
            <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Support this project"
            >
                <Heart
                    className="h-4 w-4"
                    fill={compact ? 'currentColor' : 'none'}
                />
                {compact ? null : 'Support on SupportKori'}
            </a>
        </Button>
    );
}
