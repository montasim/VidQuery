import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

const youtubeOrigins = ['https://www.youtube.com/*', 'https://youtube.com/*'];

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    publicDir: 'icons',
    outDirTemplate: '.',
    vite: () => ({ plugins: [tailwindcss()] }),
    manifest: {
        name: 'VidQuery',
        short_name: 'VidQuery',
        description:
            'Ask Gemini questions grounded in the YouTube video you are watching.',
        minimum_chrome_version: '141',
        permissions: ['activeTab', 'sidePanel', 'storage', 'tabs'],
        host_permissions: [
            ...youtubeOrigins,
            'https://generativelanguage.googleapis.com/*',
        ],
        action: {
            default_title: 'VidQuery',
            default_popup: 'popup.html',
            default_icon: {
                16: '16.png',
                32: '32.png',
                48: '48.png',
                128: '128.png',
            },
        },
        icons: {
            16: '16.png',
            32: '32.png',
            48: '48.png',
            128: '128.png',
        },
    },
});
