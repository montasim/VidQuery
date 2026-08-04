import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../shared/cn';

const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-signal text-white hover:bg-signal-dark',
                dark: 'bg-graphite text-white hover:bg-carbon',
                outline:
                    'border border-line bg-paper text-graphite hover:bg-mist',
                ghost: 'text-smoke hover:bg-mist hover:text-graphite',
                danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
            },
            size: {
                default: 'h-11 px-4',
                small: 'h-9 px-3',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: { variant: 'primary', size: 'default' },
    }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
    className,
    variant,
    size,
    asChild,
    ...props
}: ButtonProps) {
    const Component = asChild ? Slot.Root : 'button';
    return (
        <Component
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}
