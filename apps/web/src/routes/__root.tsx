import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'VidQuery — Ask what the video explains',
            },
            {
                name: 'description',
                content:
                    'Ask questions grounded in a YouTube video’s description, transcript, comments, replies, and playback context.',
            },
            {
                property: 'og:title',
                content: 'VidQuery — Ask what the video explains',
            },
            {
                property: 'og:description',
                content:
                    'A private-by-default Gemini companion for YouTube videos.',
            },
            { name: 'theme-color', content: '#FCFCFD' },
        ],
        links: [
            { rel: 'stylesheet', href: appCss },
            { rel: 'icon', href: '/brand/logo.svg', type: 'image/svg+xml' },
        ],
    }),
    shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <script
                    src="https://supportkori.com/widget.js"
                    data-id="montasim"
                    data-message="Support"
                    data-color="#EA0914"
                    data-position="right"
                />
                <Scripts />
            </body>
        </html>
    )
}
