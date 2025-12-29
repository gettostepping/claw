# claw.some — Product Design Requirements (PDR)

## 1. Overview
- **Project Name:** claw.some
- **Concept:** A highly customizable personal profile/link-in-bio platform inspired by gun.lol, themed around underground rap / music culture.
- **Stack:** Next.js (App Router), Neon PostgreSQL, Prisma ORM, NextAuth (Auth.js), Tailwind CSS.
- **Goal:** Allow users to create visually expressive profile pages with extreme customization while maintaining fast load times, security, and scalability.

## 2. Core Objectives
- Mirror the UX simplicity of gun.lol while expanding customization depth
- Support music-focused identity (artists, producers, underground communities)
- Fully database-driven using Neon + Prisma
- Clean SSR/ISR support for SEO-friendly public profiles
- Strong anti-abuse + rate limiting

## 3. Target Audience
- Underground rappers
- Producers / beatmakers
- Music collectives
- Discord / SoundCloud / Spotify users
- Gaming & underground internet culture users

## 4. Tech Stack
- **Frontend:** Next.js 14 (App Router), React Server Components, Tailwind CSS, Framer Motion (micro animations), next/image for optimized assets
- **Backend:** Next.js API Routes / Server Actions, Neon PostgreSQL, Prisma ORM
- **Auth:** NextAuth (Auth.js), Credentials login, OAuth (Discord, Google)
- **Hosting:** Vercel (frontend + edge), Neon (database)

## 5. Database Design (Prisma)
```prisma
// User
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String   @unique
  passwordHash  String?
  image         String?
  createdAt     DateTime @default(now())
  profile       Profile?
}

// Profile
model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  displayName     String?
  bio             String?
  avatarUrl       String?
  bannerUrl       String?
  backgroundType  String   // color | gradient | image | video
  backgroundValue String   // hex | css gradient | image url | mp4
  themePreset     String
  blurBackground  Boolean  @default(false)
  showViews       Boolean  @default(true)
  views           Int      @default(0)
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

// Link
model Link {
  id        String   @id @default(cuid())
  profileId String
  title     String
  url       String
  icon      String?
  order     Int
  createdAt DateTime @default(now())

  profile Profile @relation(fields: [profileId], references: [id])
}

// MusicEmbed
model MusicEmbed {
  id        String   @id @default(cuid())
  profileId String
  type      String   // soundcloud | spotify | youtube
  embedUrl  String
  autoplay  Boolean  @default(false)

  profile Profile @relation(fields: [profileId], references: [id])
}
```

## 6. Authentication Flow
- User signs up via OAuth or credentials
- Username is selected (used in `claw.some/@username`)
- Profile auto-created on first login
- JWT-based session stored via NextAuth
- Server-side session validation for edits

## 7. Routing Structure
- `/app`
  - `/@username`        → Public profile page
  - `/dashboard`        → User dashboard
  - `/dashboard/edit`   → Profile editor
  - `/api/auth`         → NextAuth
  - `/api/profile`      → Profile CRUD

## 8. Public Profile Page
- **Layout:** Full-page background, Centered profile card, Avatar, Banner, Display name, Bio, Music embed, Links list
- **Customization:** Background blur, Grain/noise overlay, Font selection, Accent color, Link hover animations, Card transparency

## 9. Profile Editor (Dashboard)
- **Sections:**
  - **Identity:** Display name, Bio, Avatar/Banner upload
  - **Background:** Color, Gradient, Image, Video
  - **Music:** Embeds (SoundCloud/Spotify/YouTube), Autoplay
  - **Links:** Drag & drop, Icon selector, Visibility
  - **Appearance:** Theme preset, Font, Border radius, Shadows

## 10. Theming (Underground Rap Aesthetic)
- **Default Presets:**
  - *Grime* – dark gray, sharp edges, mono font
  - *Basement* – black, red accents, grain
  - *Neon Trap* – purple / pink gradients
  - *Raw Tape* – off-white, rough shadows

## 11. Performance
- ISR for public profiles
- Image CDN
- Lazy-load embeds
- View counter debounced

## 12. Security & Abuse Prevention
- Rate-limited API routes
- Profanity filter
- URL validation
- Upload size limits

## 13. SEO & Sharing
- Dynamic OpenGraph images
- Custom title/description
- Twitter/X card support

## 14. Future Enhancements
- Custom domains, Analytics, Verified badges, Marketplace, Audio visualizers

## 15. MVP Checklist
- Auth (OAuth + credentials)
- Public profiles
- Profile editor
- Links
- Music embeds
- Neon + Prisma integration
