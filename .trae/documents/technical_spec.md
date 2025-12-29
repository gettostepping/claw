# Technical Specification - claw.some

## 1. Architecture Overview
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (v5/Auth.js)
- **Deployment**: Vercel

## 2. Directory Structure
```
/
├── app/
│   ├── (auth)/             # Authentication routes (login, signup)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/
│   │   └── editor/
│   ├── [username]/         # Public profile routes (dynamic segment)
│   ├── api/                # API routes
│   │   ├── auth/
│   │   └── trpc/ (optional if we use tRPC, otherwise standard API handlers)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable UI components (buttons, inputs)
│   ├── profile/            # Profile-specific components
│   ├── editor/             # Editor-specific components
│   └── shared/             # Shared components
├── lib/
│   ├── prisma.ts           # Prisma client instance
│   ├── utils.ts            # Utility functions
│   └── auth.ts             # Auth configuration
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## 3. Database Schema
(Derived strictly from PDR)

- **User**: Stores authentication and account details.
- **Profile**: Stores profile customization (bio, theme, background). One-to-one with User.
- **Link**: Stores user links. One-to-many with Profile.
- **MusicEmbed**: Stores music widgets. One-to-many with Profile.

## 4. Key Technical Decisions

### 4.1 Rendering Strategy
- **Public Profiles (`/[username]`)**: 
  - Use **ISR (Incremental Static Regeneration)** or **Server Components** with caching. 
  - Since profiles change less frequently than they are viewed, caching is critical for performance.
  - Revalidation tag: `profile-[username]`.
- **Dashboard**: 
  - **Client Components** for the editor interactions (drag-and-drop, real-time preview).
  - **Server Actions** for form submissions and data mutations.

### 4.2 Authentication
- **NextAuth.js** will handle sessions.
- **Strategies**:
  - `CredentialsProvider`: For email/password (requires hashing, e.g., bcrypt).
  - `OAuthProvider`: Discord and Google.
- **Middleware**: Protect `/dashboard` routes.

### 4.3 Image Optimization
- Use `next/image`.
- Allow remote patterns for user uploads (e.g., from AWS S3 or Supabase Storage, or generic URLs if using external hosting). 
- *Note*: PDR mentions "Image upload". We need a storage solution. Vercel Blob or an S3 compatible storage is needed. For MVP, we might assume external URLs or use a simple upload handler if configured. *Decision*: Will use Vercel Blob or suggest a storage provider if not specified.

### 4.4 Theming Engine
- Use CSS variables controlled by Tailwind.
- The `Profile` model stores `themePreset` and `backgroundValue`.
- A wrapper component `<ThemeProvider theme={profile.theme}>` will inject CSS variables into the `body` or a root container on the public profile page.

## 5. API Design
- **Server Actions** will be preferred over REST API routes for mutations (Create/Update/Delete links, updating profile) to reduce client-side JavaScript and simplify type safety.
- **GET** requests will mostly be direct database calls in Server Components.
