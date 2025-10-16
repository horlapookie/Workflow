# HP Hosting - Design Guidelines

## Design Approach

**System:** Custom Design System with Material Design influences
**Rationale:** This is a utility-focused SaaS platform requiring professional credibility, clear data visualization, and efficient bot management workflows. The design prioritizes functionality while maintaining modern aesthetics.

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary):**
- Background: 0 0% 100% (Pure White)
- Surface: 0 0% 98% (Off-white for cards/panels)
- Text Primary: 0 0% 10% (Near Black)
- Text Secondary: 0 0% 40% (Medium Gray)
- Primary (Navbar/Buttons): 0 0% 0% (Pure Black)
- Accent (Sapphire): 200 100% 50% (Cyan Blue for 💎 elements)
- Success: 142 76% 36% (Green for active bots)
- Warning: 38 92% 50% (Amber for pending states)
- Error: 0 84% 60% (Red for stopped/deleted bots)

**Dark Mode (Optional Toggle):**
- Background: 0 0% 10%
- Surface: 0 0% 15%
- Text Primary: 0 0% 95%
- Navbar: 0 0% 5%

### B. Typography

**Font Stack:**
- Primary: 'Inter' via Google Fonts (clean, modern SaaS standard)
- Monospace: 'JetBrains Mono' for logs, container IDs, session IDs

**Scale:**
- Hero/Display: text-5xl (3rem) font-bold
- Page Titles: text-3xl (1.875rem) font-semibold
- Section Headers: text-2xl (1.5rem) font-semibold
- Card Titles: text-lg (1.125rem) font-medium
- Body: text-base (1rem) font-normal
- Captions: text-sm (0.875rem) text-gray-600
- Logs/Code: text-sm font-mono

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (cards, form fields)
- Section spacing: p-8, gap-8 (page sections)
- Major spacing: p-12, p-16, p-20 (between major page areas)

**Container Widths:**
- Landing page: max-w-7xl mx-auto
- Dashboard content: max-w-6xl mx-auto
- Forms: max-w-md mx-auto
- Logs panel: Full width, h-80 (resizable)

**Grid System:**
- Bot cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Stats: grid-cols-2 md:grid-cols-4 gap-4
- Admin table: Full-width responsive table

### D. Component Library

**Navigation Bar:**
- Background: Black (0 0% 0%)
- Height: h-16
- Text: White with hover:text-gray-300
- Logo: Left-aligned, text-xl font-bold
- Links: Center-aligned (Dashboard, Create Server, Claim Sapphire, Admin*)
- User menu: Right-aligned with dropdown
- Fixed top positioning with border-b border-gray-800

**Buttons:**
- Primary: bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-medium
- Secondary: bg-white border-2 border-black text-black hover:bg-gray-50
- Destructive: bg-red-600 text-white hover:bg-red-700
- Icon buttons: p-2 rounded-md hover:bg-gray-100

**Cards:**
- Background: White with border border-gray-200
- Rounded: rounded-xl
- Shadow: shadow-sm hover:shadow-md transition
- Padding: p-6
- Sapphire balance card: Gradient border with cyan accent

**Tables (Admin Dashboard):**
- Header: bg-gray-50 border-b-2 border-gray-200 font-semibold
- Rows: hover:bg-gray-50 border-b border-gray-100
- Actions: Inline button group with icons
- Responsive: Scroll on mobile, full layout on desktop

**Forms:**
- Labels: text-sm font-medium text-gray-700 mb-2
- Inputs: border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500
- Dark mode inputs: bg-gray-800 border-gray-600 text-white
- Phone input: Prefix with country code indicator
- Session ID: Textarea with monospace font
- Validation: Red text-sm below fields

**Sapphire Claim Interface:**
- Large 💎 icon display (text-6xl) centered
- Progress bar: h-4 rounded-full bg-gray-200 with cyan fill animation
- Counter: Large text-4xl "7 / 10" below progress
- Claim button: Prominent, disabled when limit reached
- Animation: Smooth fill effect using CSS transitions (0.8s duration)
- Ad placeholder: max-w-sm mx-auto border-2 border-dashed border-gray-300 h-32 (only show when ad integrated)

**Live Logs Panel:**
- Position: Fixed bottom, resizable handle at top
- Background: bg-gray-900 text-green-400 (terminal aesthetic)
- Font: JetBrains Mono, text-sm
- Max height: h-80, overflow-y-auto
- Border top: border-t-4 border-cyan-500
- Auto-scroll to latest logs
- Resize handle: bg-gray-700 h-1 cursor-ns-resize

**Status Badges:**
- Running: bg-green-100 text-green-800 px-3 py-1 rounded-full
- Stopped: bg-gray-100 text-gray-800
- Deploying: bg-blue-100 text-blue-800 with pulse animation
- Error: bg-red-100 text-red-800

### E. Animations

**Minimal & Purposeful:**
- Sapphire fill: Vertical gradient fill animation (transform: scaleY)
- Button hover: Subtle scale(0.98) on active
- Card hover: Shadow transition (200ms)
- Page transitions: Fade in opacity (150ms)
- Logs appear: Slide up from bottom (300ms)
- Loading states: Subtle pulse on skeleton screens
- **NO** elaborate scroll animations, parallax, or decorative effects

---

## Page-Specific Layouts

### Landing Page (Pre-Login)
- **Hero Section:** 
  - Height: min-h-screen with centered content
  - Headline: "Deploy Your WhatsApp Bot in Seconds" (text-5xl font-bold)
  - Subheading: Clean description text-xl text-gray-600
  - CTA buttons: "Get Started" (primary) + "Learn More" (secondary)
  - Background: White with subtle grid pattern overlay
  - NO hero image - focus on clean typography

- **Features Grid:** 3 columns showcasing bot deployment, Sapphire system, real-time logs
- **Footer:** Links to Terms, Privacy, Contact as text links (not buttons)

### User Dashboard (Post-Login)
- **Welcome banner:** "Welcome, {Username} 👋" with Sapphire balance prominent
- **Quick actions:** Large "Create New Server" button
- **Active Bots Table:** Card-based grid on mobile, table on desktop
- **Empty state:** Helpful illustration + "Deploy your first bot" CTA

### Create Server Page
- **Centered form card:** max-w-md with clear field labels
- **Progress indicator:** Step 1: Input → Step 2: Deploying → Step 3: Running
- **Live logs panel:** Appears at bottom during deployment, shows real-time Docker output
- **Success state:** Checkmark animation + "Bot deployed successfully" + View Dashboard link

### Claim Sapphire Page
- **Centered layout:** Large 💎 icon, progress bar, claim button
- **Daily limit display:** "7 / 10 claimed today" 
- **Reset timer:** "Resets in 14h 23m"
- **Ad placeholder:** Dashed border container (hidden until ads integrated)

### Admin Dashboard
- **Sidebar navigation:** Users, All Containers, System Stats
- **Stats cards:** Total Users, Active Containers, Today's Deployments
- **Data table:** Sortable columns, bulk actions, search/filter
- **Action buttons:** Icon + text for Start/Stop/Restart/Delete

### Terms & Privacy Pages
- **Typography-focused:** max-w-4xl prose, clean section hierarchy
- **Table of contents:** Sticky sidebar on desktop
- **Contact buttons:** At bottom - Email, WhatsApp Channel, Owner Contact in horizontal row

---

## Images

**Landing Page Hero:** NO image - typography and clean design focused
**Dashboard:** NO decorative images - icon-based UI
**Empty States:** Simple line art illustrations (use HeroIcons compositions)
**Avatars:** Letter-based placeholders (first initial on colored background)

---

## Accessibility & Responsiveness

- WCAG AA contrast ratios (4.5:1 minimum)
- Focus indicators: 2px cyan ring on interactive elements
- Mobile navigation: Hamburger menu under lg breakpoint
- Touch targets: Minimum 44px for mobile buttons
- Semantic HTML: Proper heading hierarchy, ARIA labels on icon buttons
- Dark mode: Consistent implementation across all inputs and text fields