import { cn } from '#/lib/utils'

type BrandMarkProps = {
    className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
    return (
        <img
            src="/brand/logo.svg"
            alt=""
            aria-hidden="true"
            className={cn('size-8', className)}
        />
    )
}
