import { useState } from 'react'

import { cn } from '#/lib/utils'

const scenes = [
    { id: 'chat', label: 'Conversation' },
    { id: 'history', label: 'Recent' },
    { id: 'settings', label: 'Setup' },
] as const

type Scene = (typeof scenes)[number]['id']

export function ProductDemo() {
    const [scene, setScene] = useState<Scene>('chat')
    const query = new URLSearchParams({ embed: '1', scene })
    if (scene === 'chat') query.set('state', 'ready')

    return (
        <div id="demo" className="relative min-w-0 lg:pt-8">
            <p className="demo-label">Live product prototype</p>
            <div className="overflow-hidden rounded-[24px] border border-hairline bg-white shadow-product">
                <div className="flex h-11 items-center border-b border-hairline bg-cloud/80 px-4">
                    <div className="flex gap-1.5" aria-hidden="true">
                        {[0, 1, 2].map((dot) => (
                            <span
                                key={dot}
                                className="size-2.5 rounded-full bg-[#c8cdd3]"
                            />
                        ))}
                    </div>
                    <div
                        className="mx-auto flex rounded-lg border border-hairline bg-white p-0.5 text-[10px] font-bold"
                        role="tablist"
                        aria-label="Product demo scene"
                    >
                        {scenes.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={scene === item.id}
                                onClick={() => setScene(item.id)}
                                className={cn(
                                    'rounded-md px-2.5 py-1.5 text-steel transition-colors',
                                    scene === item.id && 'bg-ink text-white',
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="demo-viewport relative overflow-hidden bg-[#f8f9fa]">
                    <div className="demo-canvas">
                        <iframe
                            key={scene}
                            src={`/prototypes/extension/v1.html?${query.toString()}`}
                            title="Interactive VidQuery extension prototype"
                            loading="eager"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
