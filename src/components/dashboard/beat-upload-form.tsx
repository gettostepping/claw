"use client";

import { addBeat } from "@/actions/beats";
import { useFormStatus } from "react-dom";
import { useActionState, useState, useTransition, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Upload } from "lucide-react";

function SubmitButton({ isUploading, isActionPending }: { isUploading: boolean, isActionPending: boolean }) {
    return (
        <motion.button
            type="submit"
            disabled={isActionPending || isUploading}
            className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {isUploading ? "Uploading Beat..." : isActionPending ? "Saving..." : "Upload Beat"}
        </motion.button>
    );
}

export function BeatUploadForm() {
    const [state, formAction] = useActionState(addBeat, null);
    const [isUploading, setIsUploading] = useState(false);
    const [isActionPending, startTransition] = useTransition();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const isProcessing = useRef(false);

    async function handleFileUpload(file: File): Promise<string | null> {
        // ... same handleFileUpload ...
        try {
            const res = await fetch('/api/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    mimeType: file.type,
                    folder: 'audio'
                })
            });

            if (!res.ok) throw new Error('Failed to get presigned URL');
            const { uploadUrl, publicUrl } = await res.json();

            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error('Failed to upload to R2');

            return publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    }

    const enhancedAction = async (formData: FormData) => {
        if (isProcessing.current) return;
        isProcessing.current = true;
        setUploadError(null);

        const file = formData.get("beat") as File | null;
        if (!file || file.size === 0) {
            setUploadError("Audio file is required.");
            isProcessing.current = false;
            return;
        }

        setIsUploading(true);
        try {
            const url = await handleFileUpload(file);
            if (url) {
                formData.append("url", url);
                formData.append("fileSize", file.size.toString());
                formData.append("mimeType", file.type);
                formData.delete("beat");
            } else {
                setUploadError("Failed to upload audio to R2.");
                setIsUploading(false);
                isProcessing.current = false;
                return;
            }
        } catch (err) {
            setUploadError("An unexpected error occurred.");
            setIsUploading(false);
            isProcessing.current = false;
            return;
        }

        setIsUploading(false);
        startTransition(() => {
            formAction(formData);
            // reset processing after the action is at least started
            isProcessing.current = false;
        });
    };

    return (
        <div className="space-y-4">
            {state?.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                    {state.error}
                </div>
            )}
            {uploadError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                    {uploadError}
                </div>
            )}
            {state?.success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono">
                    Beat uploaded successfully!
                </div>
            )}

            <form action={enhancedAction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
                            Beat Title
                        </label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="Beat Name"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
                            Artist (Optional)
                        </label>
                        <input
                            name="artist"
                            type="text"
                            placeholder="Producer Name"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
                        Audio File
                    </label>
                    <input
                        name="beat"
                        type="file"
                        accept="audio/*"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
                    />
                    <p className="text-xs text-neutral-500">
                        Supported formats: MP3, WAV, OGG. Max size: 50MB
                    </p>
                </div>

                <SubmitButton isUploading={isUploading} isActionPending={isActionPending} />
            </form>
        </div>
    );
}
