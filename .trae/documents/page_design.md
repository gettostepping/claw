# Page Design & UX Flow - claw.some

## 1. Public Profile Page (`/[username]`)
**Goal**: High visual impact, fast load, immediate access to links.

- **Background**:
  - Covers 100% viewport.
  - Supports: Solid Color, Gradient (CSS), Image (Cover), Video (Looping).
  - Optional: Blur layer, Noise overlay.
- **Card Container**:
  - Centered vertically and horizontally.
  - Glassmorphism effect (optional transparency).
- **Elements**:
  1.  **Avatar**: Top center. Circle or rounded square.
  2.  **Display Name**: Large typography.
  3.  **Username**: Smaller, muted (e.g., `@username`).
  4.  **Bio**: Short text block.
  5.  **Music Embed**: iframe (Spotify/SoundCloud) or custom player.
  6.  **Links**: Stacked list of buttons.
      - *Interaction*: Hover scale, glow effect, slide animation.
  7.  **Footer**: Small "claw.some" branding.

## 2. Landing Page (`/`)
**Goal**: Convert visitors to users.

- **Hero Section**:
  - "Claim your corner of the underground."
  - Call to Action: "Create your profile" / "Login".
  - Dynamic background demonstrating the "glitch/underground" aesthetic.
- **Features Grid**:
  - "Unmatched Customization"
  - "Music First"
  - "Analytics"

## 3. Dashboard - Main (`/dashboard`)
**Goal**: Overview of performance and quick actions.

- **Header**: User greeting, "View Public Page" button.
- **Stats Cards**: Total Views, Link Clicks (MVP: just Views).
- **Quick Actions**: "Edit Profile", "Add Link".

## 4. Dashboard - Editor (`/dashboard/edit`)
**Goal**: Real-time preview editing.

- **Layout**: Two columns (on desktop).
  - **Left (Controls)**: Scrollable sidebar with accordions.
    - *Identity*: Name, Bio, Avatar.
    - *Background*: Type selector (Color/Image/Video), Upload/Input.
    - *Links*: List with drag handles. "Add Link" button.
    - *Music*: URL input, Autoplay toggle.
    - *Theme*: Preset selector, Font picker, Color overrides.
  - **Right (Preview)**: Live iframe or scaled component showing the profile as it would appear.
    - Updates in real-time as controls change.

## 5. Login / Signup (`/login`, `/signup`)
- **Style**: Minimalist, dark themed.
- **Forms**:
  - Email/Password.
  - "Continue with Discord".
  - "Continue with Google".
