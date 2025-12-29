"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

// Placeholder for the media upload action - we'll implement this
async function uploadMedia(prevState: unknown, formData: FormData) {
  // This is a placeholder - implement actual media upload logic
  console.log("Uploading media:", formData.get("media"));
  try {
    // Simulate upload process
    return { success: true };
  } catch (error) {
    return { error: "Failed to upload media" };
  }
}

async function deleteMedia(prevState: unknown, formData: FormData) {
  // This is a placeholder - implement actual media deletion logic
  console.log("Deleting media");
  try {
    // Simulate deletion process
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete media" };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 text-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {pending ? "Uploading..." : "Upload Media"}
    </motion.button>
  );
}

export function MediaUploadForm({ hasMedia, mediaType }: { hasMedia: boolean, mediaType: 'video' | 'audio' | 'image' }) {
  const [state, formAction] = useActionState(uploadMedia, null);
  const [deleteState, deleteAction] = useActionState(deleteMedia, null);

  const mediaTypeName = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);

  return (
    <div className="space-y-4">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
          {state.error}
        </div>
      )}
      {(state?.success || deleteState?.success) && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono">
          {state?.success ? `${mediaTypeName} uploaded!` : `${mediaTypeName} removed!`}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
            {mediaTypeName} Title
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder={`My Awesome ${mediaTypeName}`}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
            {mediaTypeName} Description (Optional)
          </label>
          <textarea
            name="description"
            placeholder={`Describe your ${mediaTypeName}...`}
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
            {mediaTypeName} File
          </label>
          <input
            name="media"
            type="file"
            accept={mediaType === 'video' ? 'video/*' : mediaType === 'audio' ? 'audio/*' : 'image/*'}
            required
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
          />
          <p className="text-xs text-neutral-500">
            Supported formats: {mediaType === 'video' ? 'MP4, WebM, OGG' : mediaType === 'audio' ? 'MP3, WAV, OGG' : 'JPG, PNG, GIF, WebP'}. Max size: 100MB
          </p>
        </div>

        <SubmitButton />
      </form>

      {hasMedia && (
        <form action={deleteAction}>
          <input type="hidden" name="mediaId" value="TODO" />
          <motion.button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            Remove {mediaTypeName}
          </motion.button>
        </form>
      )}
    </div>
  );
}