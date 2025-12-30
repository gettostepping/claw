"use client"

import { updateProfile } from "@/actions/profile"
import { useFormStatus } from "react-dom"
import { useActionState, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AvatarCropper } from "./avatar-cropper"

function SubmitButton({ isUploading }: { isUploading: boolean }) {
  const { pending } = useFormStatus()
  return (
    <motion.button
      type="submit"
      disabled={pending || isUploading}
      className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isUploading ? "Uploading Files..." : pending ? "Saving Profile..." : "Save Changes"}
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
  accentColor: string;
  blurBackground: boolean;
  showViews: boolean;
  views: number;
  socialSoundcloud?: string | null;
  socialYoutube?: string | null;
  socialInstagram?: string | null;
  socialDiscord?: string | null;
  createdAt: Date;
  cardStyle?: string;
  backgroundEffect?: string;
  nameEffect?: string;
};

export function ProfileForm({ profile }: { profile: ProfileType }) {
  const [state, formAction] = useActionState(updateProfile, null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Previews & State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(profile.bannerUrl || null)
  const [bgType, setBgType] = useState<string>(profile.backgroundType || "color")

  // Cropping State
  const [isCropping, setIsCropping] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [croppedAvatarBlob, setCroppedAvatarBlob] = useState<Blob | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setIsCropping(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedBlob: Blob) => {
    setCroppedAvatarBlob(croppedBlob)
    setAvatarPreview(URL.createObjectURL(croppedBlob))
    setIsCropping(false)
  }, [])

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setBannerPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleFileUpload(file: File | Blob, fileName: string, mimeType: string, folder: 'images' | 'videos'): Promise<string | null> {
    try {
      const res = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          mimeType,
          folder
        })
      });

      if (!res.ok) throw new Error('Failed to get presigned URL');
      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': mimeType }
      });

      if (!uploadRes.ok) throw new Error('Failed to upload to R2');

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }

  const enhancedAction = async (formData: FormData) => {
    setIsUploading(true);
    setUploadError(null);

    // Hande Cropped Avatar
    if (croppedAvatarBlob) {
      const url = await handleFileUpload(croppedAvatarBlob, 'avatar.png', 'image/png', 'images');
      if (url) {
        formData.append("avatarUrlDirect", url);
        formData.delete("avatarFile");
      } else {
        setUploadError("Failed to upload cropped avatar.");
        setIsUploading(false);
        return;
      }
    } else {
      // Original avatar file if not cropped (though we prompt for crop now)
      const avatarFile = formData.get("avatarFile") as File | null;
      if (avatarFile && avatarFile.size > 0) {
        const url = await handleFileUpload(avatarFile, avatarFile.name, avatarFile.type, 'images');
        if (url) {
          formData.append("avatarUrlDirect", url);
          formData.delete("avatarFile");
        }
      }
    }

    const bannerFile = formData.get("bannerFile") as File | null;
    const bgImageFile = formData.get("backgroundFileImage") as File | null;
    const bgVideoFile = formData.get("backgroundFileVideo") as File | null;

    if (bannerFile && bannerFile.size > 0) {
      const url = await handleFileUpload(bannerFile, bannerFile.name, bannerFile.type, 'images');
      if (url) {
        formData.append("bannerUrlDirect", url);
        formData.delete("bannerFile");
      } else {
        setUploadError("Failed to upload banner.");
        setIsUploading(false);
        return;
      }
    }

    if (bgType === 'image' && bgImageFile && bgImageFile.size > 0) {
      const url = await handleFileUpload(bgImageFile, bgImageFile.name, bgImageFile.type, 'images');
      if (url) {
        formData.append("backgroundUrlDirect", url);
        formData.delete("backgroundFileImage");
      } else {
        setUploadError("Failed to upload background image.");
        setIsUploading(false);
        return;
      }
    } else if (bgType === 'video' && bgVideoFile && bgVideoFile.size > 0) {
      const url = await handleFileUpload(bgVideoFile, bgVideoFile.name, bgVideoFile.type, 'videos');
      if (url) {
        formData.append("backgroundUrlDirect", url);
        formData.delete("backgroundFileVideo");
      } else {
        setUploadError("Failed to upload background video.");
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);
    formAction(formData);
  };

  return (
    <>
      <form action={enhancedAction} ref={formRef} className="space-y-8">
        {state?.error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
            {state.error}
          </div>
        )}
        {uploadError && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
            {uploadError}
          </div>
        )}
        {state?.success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono">
            Profile updated successfully!
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Display Name</label>
          <input
            name="displayName"
            defaultValue={profile.displayName || ""}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
            placeholder="Your display name"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile.bio || ""}
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none font-sans"
            placeholder="Tell the world about yourself..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sans">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Avatar Image</label>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-20 h-20 rounded-full border border-white/10 overflow-hidden bg-neutral-900 flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">??</div>
                )}
              </div>
              <input
                name="avatarFile"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all cursor-pointer font-sans"
              />
            </div>
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
          <div className="space-y-3 font-sans">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Banner Image</label>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-lg border border-white/10 overflow-hidden bg-neutral-900">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 uppercase text-xs tracking-tighter">No Banner</div>
                )}
              </div>
              <input
                name="bannerFile"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all cursor-pointer"
              />
            </div>
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
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Card Style</label>
          <select
            name="cardStyle"
            defaultValue={profile.cardStyle || "standard"}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
          >
            <option value="standard">Standard (Glass)</option>
            <option value="brutal">Brutal (Solid)</option>
            <option value="minimal">Minimal (Transparent)</option>
            <option value="neon">Neon (Glowing)</option>
            <option value="soft">Soft (Rounded)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Background Effect</label>
            <select
              name="backgroundEffect"
              defaultValue={profile.backgroundEffect || "none"}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-sans"
            >
              <option value="none">None</option>
              <option value="snow">Snow</option>
              <option value="rain">Rain</option>
              <option value="stars">Stars</option>
              <option value="fireflies">Fireflies</option>
              <option value="cherry-blossoms">Cherry Blossoms</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Name Effect</label>
            <select
              name="nameEffect"
              defaultValue={profile.nameEffect || "none"}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-sans"
            >
              <option value="none">None</option>
              <option value="purple-particles">Purple Particles</option>
              <option value="golden-glow">Golden Glow</option>
              <option value="rainbow">Rainbow</option>
              <option value="glitch">Glitch</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              name="accentColor"
              type="color"
              defaultValue={profile.accentColor || "#a855f7"}
              className="w-12 h-10 border border-white/10 rounded-lg cursor-pointer bg-transparent"
            />
            <input
              type="text"
              name="accentColorText"
              defaultValue={profile.accentColor || "#a855f7"}
              onChange={(e) => {
                const colorInput = e.target.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
                if (colorInput) colorInput.value = (e.target as HTMLInputElement).value;
              }}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Background Type</label>
          <select
            name="backgroundType"
            value={bgType}
            onChange={(e) => setBgType(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
          >
            <option value="color">Color</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Background Value</label>
          {bgType === 'color' && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  name="backgroundValue"
                  type="color"
                  defaultValue={profile.backgroundType === 'color' ? profile.backgroundValue || "#000000" : "#000000"}
                  className="w-12 h-10 border border-white/10 rounded-lg cursor-pointer bg-transparent"
                />
                <input
                  name="backgroundValueText"
                  type="text"
                  defaultValue={profile.backgroundType === 'color' ? profile.backgroundValue || "#000000" : "#000000"}
                  placeholder="Hex color"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono"
                />
              </div>
              <p className="text-xs text-neutral-500">Click the color box to open color picker, or enter hex code</p>
            </div>
          )}
          {bgType === 'image' && (
            <div className="space-y-3 font-sans">
              <input
                name="backgroundFileImage"
                type="file"
                accept="image/*"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all cursor-pointer"
              />
              <p className="text-xs text-neutral-500">Current background: {profile.backgroundValue && (profile.backgroundType === 'image') ? <a href={profile.backgroundValue} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View current</a> : 'None set'}</p>
              {profile.backgroundValue && (profile.backgroundType === 'image') && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="removeBackground"
                    id="removeBackgroundImage"
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="removeBackgroundImage" className="text-sm text-neutral-400">Remove current background</label>
                </div>
              )}
            </div>
          )}
          {bgType === 'video' && (
            <div className="space-y-3 font-sans">
              <input
                name="backgroundFileVideo"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all cursor-pointer"
              />
              <p className="text-xs text-neutral-500 mt-2">Upload a video (MP4, WebM, OGG). Max 50MB. Video will be muted and loop automatically.</p>
              <p className="text-xs text-neutral-500">Current video: {profile.backgroundValue && (profile.backgroundType === 'video') ? <a href={profile.backgroundValue} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View current</a> : 'None set'}</p>
              {profile.backgroundValue && (profile.backgroundType === 'video') && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    name="removeBackground"
                    id="removeBackgroundVideo"
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="removeBackgroundVideo" className="text-sm text-neutral-400">Remove current video</label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6 pt-6 border-t border-white/10">
          <h3 className="font-bold text-xl flex items-center gap-3 font-sans">
            <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            Socials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">SoundCloud</label>
              <input
                name="socialSoundcloud"
                defaultValue={profile.socialSoundcloud || ""}
                placeholder="SoundCloud Profile URL"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">YouTube</label>
              <input
                name="socialYoutube"
                defaultValue={profile.socialYoutube || ""}
                placeholder="YouTube Channel URL"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Instagram</label>
              <input
                name="socialInstagram"
                defaultValue={profile.socialInstagram || ""}
                placeholder="Instagram Profile URL"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider font-sans">Discord</label>
              <input
                name="socialDiscord"
                defaultValue={profile.socialDiscord || ""}
                placeholder="Discord Username (e.g. user#1234)"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <SubmitButton isUploading={isUploading} />
        </div>
      </form>

      <AnimatePresence>
        {isCropping && imageToCrop && (
          <AvatarCropper
            image={imageToCrop}
            onCropComplete={onCropComplete}
            onCancel={() => setIsCropping(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
