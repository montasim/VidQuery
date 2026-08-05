import { MenuIcon } from 'lucide-react'

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
        <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline/80 bg-paper/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
                <a
                    href="#top"
                    className="flex items-center gap-2.5"
                    aria-label="VidQuery home"
                >
                    <BrandMark className="size-7" />
                    <span className="font-display text-sm font-extrabold tracking-[-0.03em]">
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
                    <Button
                        asChild
                        className="ml-3 h-10 rounded-xl bg-ink px-4 font-bold !text-white hover:bg-signal"
                    >
                        <a href={downloadUrl}>Download latest</a>
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
                            <SheetTitle className="flex items-center gap-2 font-display font-extrabold">
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
                                        className="rounded-xl px-3 py-3.5 font-semibold hover:bg-cloud"
                                    >
                                        {link.label}
                                    </a>
                                </SheetClose>
                            ))}
                        </nav>
                        <div className="mt-auto p-4">
                            <Button
                                asChild
                                className="h-11 w-full rounded-xl bg-signal font-bold !text-white hover:bg-signal-dark"
                            >
                                <a href={downloadUrl}>Download for Chrome</a>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
