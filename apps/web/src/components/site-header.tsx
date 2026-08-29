import { DownloadIcon, MenuIcon } from 'lucide-react'

import { BrandMark } from '#/components/brand-mark'
import { Button } from '#/components/ui/button'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '#/components/ui/sheet'

const downloadUrl =
    'https://github.com/montasim/VidQuery/releases/latest/download/VidQuery-chrome-unpacked.zip'

const links = [
    { href: '#how', label: 'How it works' },
    { href: '#privacy', label: 'Privacy' },
    { href: '#install', label: 'Install' },
    { href: 'https://github.com/montasim/VidQuery', label: 'GitHub ↗' },
]

export function SiteHeader() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline/80 bg-paper/90 px-5 backdrop-blur-xl sm:px-8 lg:px-12">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center">
                <a
                    href="#top"
                    className="flex items-center gap-2.5"
                    aria-label="VidQuery home"
                >
                    <BrandMark className="size-7" />
                    <span className="font-display text-sm font-bold tracking-[-0.02em]">
                        VidQuery
                    </span>
                </a>

                <nav
                    className="ml-auto hidden items-center gap-1 md:flex"
                    aria-label="Primary navigation"
                >
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="nav-link"
                        >
                            {link.label}
                        </a>
                    ))}
                    <Button asChild className="download-button ml-3">
                        <a href={downloadUrl}>
                            Download for Chrome{' '}
                            <DownloadIcon data-icon="inline-end" />
                        </a>
                    </Button>
                </nav>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto md:hidden"
                            aria-label="Open navigation"
                        >
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[320px] border-hairline bg-paper p-0">
                        <SheetHeader className="border-b border-hairline px-6 py-5 text-left">
                            <SheetTitle className="flex items-center gap-2 font-display font-bold">
                                <BrandMark className="size-7" /> VidQuery
                            </SheetTitle>
                            <SheetDescription>
                                Ask what the video already explains.
                            </SheetDescription>
                        </SheetHeader>
                        <nav
                            className="flex flex-col px-3 py-4"
                            aria-label="Mobile navigation"
                        >
                            {links.map((link) => (
                                <SheetClose asChild key={link.href}>
                                    <a
                                        href={link.href}
                                        className="rounded-xl px-3 py-3.5 font-medium hover:bg-cloud"
                                    >
                                        {link.label}
                                    </a>
                                </SheetClose>
                            ))}
                        </nav>
                        <div className="mt-auto p-4">
                            <Button asChild className="download-button w-full">
                                <a href={downloadUrl}>
                                    Download for Chrome{' '}
                                    <DownloadIcon data-icon="inline-end" />
                                </a>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
