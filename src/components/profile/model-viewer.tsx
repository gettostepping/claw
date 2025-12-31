"use client"

import { useEffect, useRef } from "react"

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string
                'ios-src'?: string
                poster?: string
                alt?: string
                'shadow-intensity'?: string
                'camera-controls'?: boolean
                'auto-rotate'?: boolean
                ar?: boolean
                loading?: 'auto' | 'lazy' | 'eager'
                reveal?: 'auto' | 'interaction' | 'manual'
                'min-camera-orbit'?: string
                'min-field-of-view'?: string
                'interpolation-decay'?: string
            }, HTMLElement>
        }
    }
}

export function ModelViewer({ url }: { url: string }) {
    const modelViewerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Dynamic import to avoid SSR issues with web components
        import("@google/model-viewer").catch(console.error);
    }, []);

    if (!url) return null

    return (
        <div className="w-full h-[400px] relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
            <model-viewer
                src={url}
                alt="A 3D model"
                camera-controls /* Enables mouse interaction */
                auto-rotate
                shadow-intensity="1"
                loading="lazy"
                min-camera-orbit="auto auto 0m" /* Allow zooming all the way in to 0 meters */
                min-field-of-view="2deg" /* Allow extreme zoom via FOV */
                interpolation-decay="200"
                style={{ width: '100%', height: '100%' }}
            >
                <div slot="poster" className="absolute inset-0 flex items-center justify-center text-white/50">
                    Loading 3D Model...
                </div>
            </model-viewer>
        </div>
    )
}
