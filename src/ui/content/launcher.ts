const LAUNCHER_ID = 'youtube-helper-launcher';

export function mountAssistantLauncher(
    openAssistant: () => Promise<unknown>
): () => void {
    document.getElementById(LAUNCHER_ID)?.remove();

    const host = document.createElement('div');
    host.id = LAUNCHER_ID;
    host.style.cssText = [
        'position:fixed',
        'right:22px',
        'bottom:22px',
        'z-index:2147483647',
    ].join(';');

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
        :host { all: initial; }
        button {
            animation: launcher-enter 320ms cubic-bezier(.16, 1, .3, 1) both;
            align-items: center;
            background: #e32620;
            border: 1px solid rgba(87, 10, 8, .24);
            border-radius: 15px;
            box-shadow: 0 12px 30px rgba(23, 23, 23, .24), 0 2px 6px rgba(23, 23, 23, .16);
            color: #fff;
            cursor: pointer;
            display: flex;
            font: 700 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            gap: 9px;
            min-height: 46px;
            padding: 0 16px 0 11px;
            transition: background 140ms ease, box-shadow 140ms ease, transform 140ms ease;
            white-space: nowrap;
        }
        button:hover { background: #c9201b; transform: translateY(-1px); }
        button:hover svg { transform: translateX(1px) rotate(-2deg); }
        button:active { transform: translateY(0); }
        button:focus-visible { outline: 3px solid rgba(227, 38, 32, .35); outline-offset: 3px; }
        button:disabled { cursor: wait; opacity: .72; transform: none; }
        svg { display: block; height: 24px; transition: transform 180ms cubic-bezier(.16, 1, .3, 1); width: 24px; }
        @keyframes launcher-enter {
            from { opacity: 0; transform: translateY(8px) scale(.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
            button { border-radius: 50%; height: 48px; justify-content: center; padding: 0; width: 48px; }
            span { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            button { animation: none; transition: none; }
            svg { transition: none; }
        }
    `;

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Ask this video with VidQuery');
    button.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 64 64">
            <path fill="#fff" d="M15 6h34c6.1 0 11 4.9 11 11v25c0 6.1-4.9 11-11 11H38.8L27 60v-7H15C8.9 53 4 48.1 4 42V17C4 10.9 8.9 6 15 6Z"/>
            <path fill="#e32620" d="M26 19.5 44 29.8 26 40.2V19.5Z"/>
        </svg>
        <span>Ask this video</span>
    `;
    const label = button.querySelector('span');
    button.addEventListener('click', () => {
        button.disabled = true;
        void openAssistant()
            .catch(() => {
                if (label) label.textContent = 'Reload extension';
                button.title =
                    'The Side Panel could not open. Reload the extension and this YouTube tab.';
            })
            .finally(() => {
                button.disabled = false;
            });
    });

    shadow.append(style, button);
    document.documentElement.append(host);
    return () => host.remove();
}
