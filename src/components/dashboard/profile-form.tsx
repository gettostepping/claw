"use client"

import { updateProfile } from "@/actions/profile"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { motion } from "framer-motion"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {pending ? "Saving..." : "Save Changes"}
    </motion.button>
  )
}

type ProfileType = {
  id: string;
  userId: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  backgroundType: string;
  backgroundValue: string;
  themePreset: string;
  blurBackground: boolean;
  showViews: boolean;
  views: number;
  socialSoundcloud?: string | null;
  socialYoutube?: string | null;
  socialInstagram?: string | null;
  socialDiscord?: string | null;
  createdAt: Date;
};

export function ProfileForm({ profile }: { profile: ProfileType }) {
  const [state, formAction] = useActionState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-8">
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          const backgroundType = document.getElementById('backgroundType');
          if (backgroundType) {
            const colorFields = document.getElementById('color-fields');
            const imageFields = document.getElementById('image-fields');
            
            if (backgroundType.value === 'color') {
              if (colorFields) colorFields.style.display = 'block';
              if (imageFields) imageFields.style.display = 'none';
            } else {
              if (colorFields) colorFields.style.display = 'none';
              if (imageFields) imageFields.style.display = 'block';
            }
          }
        })();
      `}} />
      {state?.error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono">
          Profile updated!
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Display Name</label>
        <input
          name="displayName"
          defaultValue={profile.displayName || ""}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          placeholder="Your display name"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio || ""}
          rows={4}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
          placeholder="Tell the world about yourself..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Avatar Image</label>
          <input
            name="avatarFile"
            type="file"
            accept="image/*"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
          />
          <p className="text-xs text-neutral-500">Current: {profile.avatarUrl ? <a href={profile.avatarUrl} target="_blank" className="text-purple-400 hover:underline">View current avatar</a> : 'No avatar set'}</p>
          {profile.avatarUrl && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="removeAvatar"
                id="removeAvatar"
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="removeAvatar" className="text-sm text-neutral-400">Remove current avatar</label>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Banner Image</label>
          <input
            name="bannerFile"
            type="file"
            accept="image/*"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
          />
          <p className="text-xs text-neutral-500">Current: {profile.bannerUrl ? <a href={profile.bannerUrl} target="_blank" className="text-purple-400 hover:underline">View current banner</a> : 'No banner set'}</p>
          {profile.bannerUrl && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="removeBanner"
                id="removeBanner"
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="removeBanner" className="text-sm text-neutral-400">Remove current banner</label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Theme Preset</label>
        <select
          name="themePreset"
          defaultValue={profile.themePreset || "grime"}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
        >
          <option value="grime">Grime</option>
          <option value="basement">Basement</option>
          <option value="neon_trap">Neon Trap</option>
          <option value="raw_tape">Raw Tape</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="dark_ambient">Dark Ambient</option>
          <option value="vaporwave">Vaporwave</option>
          <option value="lofi">Lofi</option>
          <option value="punk">Punk</option>
          <option value="trap">Trap</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Background Type</label>
        <select
          name="backgroundType"
          id="backgroundType"
          defaultValue={profile.backgroundType || "color"}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          onChange={(e) => {
            const colorFields = document.getElementById('color-fields');
            const imageFields = document.getElementById('image-fields');
            
            if (e.target.value === 'color') {
              if (colorFields) colorFields.style.display = 'block';
              if (imageFields) imageFields.style.display = 'none';
            } else {
              if (colorFields) colorFields.style.display = 'none';
              if (imageFields) imageFields.style.display = 'block';
            }
          }}
        >
          <option value="color">Color</option>
          <option value="image">Image</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Background Value</label>
        <div id="color-fields" style={{display: profile.backgroundType === 'color' ? 'block' : 'none'}}>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                name="backgroundValue"
                type="color"
                defaultValue={profile.backgroundType === 'color' ? profile.backgroundValue || "#000000" : "#000000"}
                className="w-12 h-10 border border-white/10 rounded-lg cursor-pointer"
              />
              <input
                name="backgroundValueText"
                type="text"
                defaultValue={profile.backgroundType === 'color' ? profile.backgroundValue || "#000000" : "#000000"}
                placeholder="Hex color"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <p className="text-xs text-neutral-500">Click the color box to open color picker, or enter hex code</p>
          </div>
        </div>
        <div id="image-fields" style={{display: profile.backgroundType === 'image' ? 'block' : 'none'}}>
          <input
            name="backgroundFile"
            type="file"
            accept="image/*"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
          />
          <p className="text-xs text-neutral-500">Current: {profile.backgroundValue && (profile.backgroundType === 'image') ? <a href={profile.backgroundValue} target="_blank" className="text-purple-400 hover:underline">View current background</a> : 'No background image set'}</p>
          {profile.backgroundValue && (profile.backgroundType === 'image') && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="removeBackground"
                id="removeBackground"
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="removeBackground" className="text-sm text-neutral-400">Remove current background</label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/10">
        <h3 className="font-bold text-xl flex items-center gap-3">
          <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          Socials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">SoundCloud</label>
            <input
              name="socialSoundcloud"
              defaultValue={profile.socialSoundcloud || ""}
              placeholder="SoundCloud Profile URL"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">YouTube</label>
            <input
              name="socialYoutube"
              defaultValue={profile.socialYoutube || ""}
              placeholder="YouTube Channel URL"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Instagram</label>
            <input
              name="socialInstagram"
              defaultValue={profile.socialInstagram || ""}
              placeholder="Instagram Profile URL"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Discord</label>
            <input
              name="socialDiscord"
              defaultValue={profile.socialDiscord || ""}
              placeholder="Discord Username (e.g. user#1234)"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <SubmitButton />
      </div>
    </form>
  )
}
