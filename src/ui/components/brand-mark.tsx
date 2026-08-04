import { cn } from '../../shared/cn';

export function BrandMark({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={cn('shrink-0', className)}
            viewBox="0 0 64 64"
        >
            <path
                d="M15 6h34c6.1 0 11 4.9 11 11v25c0 6.1-4.9 11-11 11H38.8L27 60v-7H15C8.9 53 4 48.1 4 42V17C4 10.9 8.9 6 15 6Z"
                fill="#E32620"
            />
            <path d="M26 19.5 44 29.8 26 40.2V19.5Z" fill="white" />
        </svg>
    );
}
