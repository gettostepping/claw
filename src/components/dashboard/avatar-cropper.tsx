"use client"

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion } from 'framer-motion'
import { X, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface Point {
    x: number
    y: number
}

interface Area {
    width: number
    height: number
    x: number
    y: number
}

interface AvatarCropperProps {
    image: string
    onCropComplete: (blob: Blob) => void
    onCancel: () => void
}

export function AvatarCropper({ image, onCropComplete, onCancel }: AvatarCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropChange = (crop: Point) => setCrop(crop)
    const onZoomChange = (zoom: number) => setZoom(zoom)

    const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return null

        const rotRad = (rotation * Math.PI) / 180
        const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
            image.width,
            image.height,
            rotation
        )

        canvas.width = bBoxWidth
        canvas.height = bBoxHeight

        ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
        ctx.rotate(rotRad)
        ctx.translate(-image.width / 2, -image.height / 2)

        ctx.drawImage(image, 0, 0)

        const data = ctx.getImageData(
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height
        )

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.putImageData(data, 0, 0)

        return new Promise((resolve) => {
            canvas.toBlob((file) => {
                resolve(file)
            }, 'image/png')
        })
    }

    const rotateSize = (width: number, height: number, rotation: number) => {
        const rotRad = (rotation * Math.PI) / 180
        return {
            width:
                Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
            height:
                Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
        }
    }

    const handleDone = async () => {
        if (!croppedAreaPixels) return
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels, rotation)
            if (croppedBlob) {
                onCropComplete(croppedBlob)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                    <h3 className="font-bold text-lg text-white">Crop Avatar</h3>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="relative flex-1 min-h-[400px] bg-neutral-950">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 space-y-6 bg-neutral-900 border-t border-white/10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut size={18} className="text-neutral-500" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 accent-purple-600"
                            />
                            <ZoomIn size={18} className="text-neutral-500" />
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={() => setRotation(r => (r - 90) % 360)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition-colors"
                            >
                                <RotateCcw size={16} />
                                Rotate
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-lg font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-all border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDone}
                            className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            Set Avatar
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
