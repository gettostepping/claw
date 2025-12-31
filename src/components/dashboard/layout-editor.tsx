"use client"

import { useState, useRef, useEffect } from "react"
import { motion, Reorder, useDragControls } from "framer-motion"
import { LayoutPanelTop, LayoutPanelLeft, LayoutTemplate, Check, X, Smartphone, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LayoutItemConfig {
    position: 'top' | 'bottom' | 'left' | 'right'
    variant: 'full' | 'short' // full = wide, short = compact
}

export interface LayoutConfig {
    tracks: LayoutItemConfig
    media: LayoutItemConfig
    combined?: boolean // legacy/simple flag, mostly derived from positions being same
}

interface LayoutEditorProps {
    initialConfig?: string
    onSave: (config: string) => void
    onCancel: () => void
}

const ZONES = ['top', 'left', 'right', 'bottom'] as const
type Zone = typeof ZONES[number]

export function LayoutEditor({ initialConfig, onSave, onCancel }: LayoutEditorProps) {
    // Parse config or use defaults
    const [config, setConfig] = useState<LayoutConfig>(() => {
        const defaults: LayoutConfig = {
            tracks: { position: 'left', variant: 'short' },
            media: { position: 'right', variant: 'short' }
        }

        if (!initialConfig || initialConfig === "{}" || initialConfig === "") {
            return defaults
        }

        try {
            const parsed = JSON.parse(initialConfig)
            // Merge with defaults to ensure keys exist
            return {
                tracks: parsed.tracks || defaults.tracks,
                media: parsed.media || defaults.media,
                combined: parsed.combined
            }
        } catch {
            return defaults
        }
    })

    // Helper to update a specific item
    const updateItem = (item: 'tracks' | 'media', updates: Partial<LayoutItemConfig>) => {
        setConfig(prev => ({
            ...prev,
            [item]: { ...prev[item], ...updates }
        }))
    }

    // Drag handlers
    const handleDragEnd = (item: 'tracks' | 'media', info: any) => {
        // Simple hit detection logic could go here, but for this UI, 
        // we'll make clickable zones or simple drop logic based on pointer
        // For simplicity in this iteration, we might use dedicated buttons in the zones 
        // OR visual drag. Framer drag is great but custom drop zones require calculation.
        // Let's implement a simpler "Click to Move" or very robust constraints.

        // Actually, let's just use specific click-to-move for reliability 
        // unless I implement full ref-based collision detection.
        // Given "drag ... around", I should try DnD.
    }

    // Implementation Note: Full generic DnD with collision in React is complex.
    // We will build a visual grid where you can drag the box to a slot.

    // Simplification: We render the 5 slots (Top, Left, Center(Fixed), Right, Bottom)
    // You drag the item into a slot.

    // State to track where things are visually
    // items: { id: 'tracks' | 'media', zone: Zone }[]

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <LayoutPanelTop className="w-5 h-5 text-purple-500" />
                            Layout Editor
                        </h2>
                        <p className="text-sm text-neutral-400">Drag items to position them around your profile card.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onSave(JSON.stringify(config))}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Save Layout
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative bg-neutral-950/50 p-8 overflow-y-auto">
                    {/* Grid Layout Container */}
                    <div className="max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-center gap-4 relative">

                        {/* Top Zone */}
                        <DropZone
                            position="top"
                            config={config}
                            onDrop={(item) => updateItem(item, { position: 'top' })}
                            onUpdateVariant={(item, v) => updateItem(item, { variant: v })}
                        />

                        <div className="flex gap-4 w-full justify-center min-h-[300px]">
                            {/* Left Zone */}
                            <DropZone
                                position="left"
                                config={config}
                                onDrop={(item) => updateItem(item, { position: 'left', variant: 'short' })} // Side is always short/vertical naturally
                            />

                            {/* Main Profile Card (Visual only) */}
                            <div className="w-[350px] shrink-0 bg-neutral-900/80 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 select-none">
                                <div className="w-24 h-24 rounded-full bg-neutral-800 animate-pulse" />
                                <div className="w-32 h-4 bg-neutral-800 rounded animate-pulse" />
                                <div className="w-48 h-3 bg-neutral-800/50 rounded animate-pulse" />
                                <span className="text-neutral-500 font-medium">Main Profile</span>
                            </div>

                            {/* Right Zone */}
                            <DropZone
                                position="right"
                                config={config}
                                onDrop={(item) => updateItem(item, { position: 'right', variant: 'short' })}
                            />
                        </div>

                        {/* Bottom Zone */}
                        <DropZone
                            position="bottom"
                            config={config}
                            onDrop={(item) => updateItem(item, { position: 'bottom' })}
                            onUpdateVariant={(item, v) => updateItem(item, { variant: v })}
                        />

                    </div>

                    {/* Draggable Source Helpers (If not placed? No, they start placed) */}
                    {/* Floating Instruction */}
                    <div className="absolute bottom-4 left-4 bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-400 max-w-[200px]">
                        <p><strong>Config:</strong></p>
                        <pre className="mt-1 font-mono text-[10px] text-neutral-500">{JSON.stringify(config, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Subcomponent for Zones
function DropZone({
    position,
    config,
    onDrop,
    onUpdateVariant
}: {
    position: Zone,
    config: LayoutConfig,
    onDrop: (item: 'tracks' | 'media') => void
    onUpdateVariant?: (item: 'tracks' | 'media', v: 'full' | 'short') => void
}) {
    // Check what's in this zone
    const itemsInZone = (Object.keys(config) as ('tracks' | 'media')[]).filter(k =>
        (k === 'tracks' || k === 'media') && config[k].position === position
    )

    const isSides = position === 'left' || position === 'right'
    const isVertical = position === 'top' || position === 'bottom'

    return (
        <div
            className={cn(
                "border-2 border-dashed border-neutral-800/50 rounded-xl transition-all duration-300 flex flex-col gap-2 p-2",
                // Dimensions based on position
                isVertical && "w-full min-h-[120px] items-center justify-center",
                isSides && "w-[200px] min-h-[300px] items-center justify-center",
                // Highlight if items present
                itemsInZone.length > 0 && "bg-neutral-900/30 border-neutral-700/50 border-solid",
                itemsInZone.length === 0 && "hover:bg-neutral-800/20 hover:border-neutral-700"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                const item = e.dataTransfer.getData('item') as 'tracks' | 'media'
                if (item) onDrop(item)
            }}
        >
            {itemsInZone.length === 0 && (
                <span className="text-neutral-700 font-medium text-sm uppercase tracking-wider">{position} Area</span>
            )}

            {itemsInZone.map(item => (
                <DraggableItem
                    key={item}
                    id={item}
                    variant={config[item].variant}
                    allowVariantToggle={isVertical}
                    onToggleVariant={(v) => onUpdateVariant && onUpdateVariant(item, v)}
                />
            ))}
        </div>
    )
}

function DraggableItem({
    id,
    variant,
    allowVariantToggle,
    onToggleVariant
}: {
    id: string,
    variant: 'full' | 'short',
    allowVariantToggle?: boolean,
    onToggleVariant?: (v: 'full' | 'short') => void
}) {
    return (
        <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData('item', id)}
            className={cn(
                "bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing transition-all hover:ring-2 ring-purple-500/50 bg-gradient-to-br",
                id === 'tracks' ? "from-orange-500/10 to-orange-900/10 border-orange-500/20" : "from-blue-500/10 to-blue-900/10 border-blue-500/20",
                // Size
                variant === 'full' && "w-[90%] max-w-2xl",
                variant === 'short' && "w-[180px] h-[100px]"
            )}
        >
            <div className="flex justify-between items-center w-full">
                <span className={cn(
                    "font-bold capitalize text-sm",
                    id === 'tracks' ? "text-orange-400" : "text-blue-400"
                )}>
                    {id}
                </span>

                {allowVariantToggle && (
                    <div className="flex bg-neutral-900 rounded p-1 gap-1">
                        <button
                            onClick={() => onToggleVariant?.('short')}
                            className={cn("p-1 rounded", variant === 'short' ? "bg-neutral-700 text-white" : "text-neutral-600 hover:text-white")}
                            title="Short (Box)"
                        >
                            <Smartphone className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onToggleVariant?.('full')}
                            className={cn("p-1 rounded", variant === 'full' ? "bg-neutral-700 text-white" : "text-neutral-600 hover:text-white")}
                            title="Wide (Full)"
                        >
                            <Monitor className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 w-full bg-neutral-900/50 rounded flex items-center justify-center overflow-hidden relative">
                <div className="space-y-1 w-2/3 opacity-50">
                    <div className="h-2 w-full bg-current rounded-full" />
                    <div className="h-2 w-2/3 bg-current rounded-full" />
                </div>
            </div>
        </div>
    )
}
