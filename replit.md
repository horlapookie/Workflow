# HP Hosting - WhatsApp Bot Deployment Platform

## Overview

HP Hosting is a SaaS platform that enables users to deploy and manage automated WhatsApp bot servers using Docker containers. The platform provides a streamlined workflow for creating, monitoring, and controlling bot instances with a gamified reward system (Sapphire currency) for daily engagement.

**Core Purpose:** Simplify WhatsApp bot deployment by abstracting Docker container management through an intuitive web interface with automated provisioning via Pterodactyl panel integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (October 15, 2025)

### Local Bot Deployment System (Latest - October 15, 2025)
- **Issue**: Remote git cloning was unreliable; bot deployments failing due to file upload issues
- **Solution**: Complete deployment system overhaul to use local bot files:
  1. **Bot Repository Cloning**: Bot repo now cloned locally into `bot-template/` folder
  2. **Archive Creation**: System creates custom tar.gz archives with user's SESSION-ID, prefix, and phone pre-configured
  3. **Two-Step File Upload**: 
     - Step 1: Request signed upload URL from Pterodactyl API
     - Step 2: Upload bot.tar.gz to signed URL using multipart/form-data
  4. **Simplified Startup Script**: Server extracts tarball and runs `npm start` (npm install handled automatically by Pterodactyl)
  5. **Node.js 22 Upgrade**: Updated Docker image from Node.js 18 to Node.js 22
- **Result**: Deployments now:
  - Pre-configure all bot settings before upload (no remote git operations)
  - Upload complete bot package as single archive
  - Start faster with automatic dependency installation
  - Use latest Node.js 22 runtime

### Real-Time WebSocket Log Streaming (Latest - October 15, 2025)
- **Implementation**: Full WebSocket infrastructure for live bot console logs:
  1. **Backend WebSocket Server** (`server/websocket.ts`):
     - WebSocket server on `/ws` path
     - Fetches Pterodactyl WebSocket credentials via `/api/client/servers/{id}/websocket`
     - Bridges Pterodactyl console events to frontend clients
     - Handles auth, token expiry, reconnection automatically
  2. **Frontend WebSocket Client** (`LiveLogsPanel.tsx`):
     - Replaces polling with WebSocket connection
     - Real-time console output streaming
     - Connection status indicator (green pulse = connected, red = disconnected)
     - Auto-reconnect on disconnection
  3. **Event Types Supported**:
     - `console output` - Bot console logs
     - `status` - Server state changes (running/stopped)
     - `stats` - Real-time resource usage (CPU/memory)
     - `token expiring/expired` - Auto-refresh credentials
- **Result**: Users now see live bot console output without delays, connection status is visible

### Previous Deployment Improvements
- **Startup Script Fix**: Base64-encoded Node.js script safely writes SESSION-ID and updates config.js
- **NPM Dependency Fix**: Removed `--legacy-peer-deps` flag (Pterodactyl handles dependencies)
- **Security Enhancements**: Fixed O(N) API key validation DoS vulnerability → O(1) lookups
  
### Security Enhancements
- Fixed critical O(N) API key validation DoS vulnerability → now O(1) with keyId-based lookup
- Eliminated command injection vectors in Pterodactyl deployment scripts
- Added MongoDB index on apiKeys.keyId for performance

### Deployment Improvements
- Dynamic allocation lookup from Pterodactyl API (no hardcoded ports)
- Idempotent startup with `git reset --hard && git pull` for restarts
- Base64-encoded setup scripts for safe transfer through Pterodactyl
- Dashboard auto-refreshes to show newly deployed bots

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite for development and production builds
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with custom shadcn/ui implementation
- **Styling:** Tailwind CSS with custom design system

**Design System:**
- Custom Material Design-influenced system optimized for utility/SaaS workflows
- Inter font for UI, JetBrains Mono for code/logs
- Light mode primary with optional dark mode
- Sapphire accent color (cyan blue #00BFFF) for premium features
- Consistent spacing scale using Tailwind units

**Key Frontend Features:**
- Component-based architecture with reusable UI elements (BotCard, AdminTable, StatsCard)
- Real-time deployment logs with animated terminal output
- Form validation using React Hook Form with Zod resolvers
- Toast notifications for user feedback
- Responsive design with mobile breakpoint at 768px

**Rationale:** React + Vite provides fast development cycles with hot module replacement. TanStack Query handles complex async state with built-in caching and invalidation. Radix UI ensures accessibility while allowing full styling control.

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js framework
- **Language:** TypeScript with ES modules
- **Database:** MongoDB with Mongoose ODM
- **Session Management:** Express-session (configured for production use)
- **Authentication:** bcrypt for password hashing, OTP-based email verification

**API Structure:**
- RESTful endpoints under `/api` namespace
- Session-based authentication with HttpOnly cookies
- Middleware for request logging and error handling
- Separate route handlers for auth, bots, sapphire claims, and admin functions

**Server Organization:**
- `server/index.ts` - Express app initialization and middleware setup
- `server/routes.ts` - API endpoint definitions and WebSocket server setup
- `server/auth.ts` - Authentication logic (login, signup, verification)
- `server/db.ts` - MongoDB connection and Mongoose schemas
- `server/email.ts` - Nodemailer configuration for OTP delivery
- `server/pterodactyl.ts` - Pterodactyl API integration for container deployment and file uploads
- `server/websocket.ts` - WebSocket server for real-time log streaming from Pterodactyl
- `bot-template/` - Local WhatsApp bot repository (https://github.com/horlapookie/Horlapookie-bot)

**Deployment Logic:**
- Users provide phone number, command prefix, and session ID
- Backend process:
  1. Queries Pterodactyl for available port allocations
  2. Creates custom bot archive (tar.gz) with:
     - All files from local `bot-template/` folder
     - SESSION-ID file pre-written with user's session data
     - config.js pre-configured with user's prefix and phone number
  3. Creates Pterodactyl server with Node.js 22 Docker image
  4. Uploads bot archive using two-step Pterodactyl file upload API:
     - Requests signed upload URL from panel
     - Posts archive to signed URL
  5. Server startup script:
     - Checks for bot.tar.gz file
     - Extracts archive to container root
     - Runs `npm start` (dependencies auto-installed by Pterodactyl)
- After successful deployment, user redirected to dashboard showing all their bots
- Real-time logs streamed via WebSocket to frontend

**CLI API System:**
- Secure API key format: `hp_{keyId}_{secret}` for O(1) validation
- Admin can generate API keys for users via POST /api/admin/users/:userId/api-keys
- Users manage their own keys via GET/POST/DELETE /api/users/me/api-keys
- API keys bcrypt-hashed (10 rounds) with MongoDB index on apiKeys.keyId
- Bot control endpoints support both session and API key (Bearer token) authentication
- CLI users can programmatically start/stop/restart/delete servers

**Rationale:** Express provides mature, well-documented server framework. MongoDB offers flexible schema for user data and bot configurations. Session-based auth chosen over JWT for simpler server-side state management and session revocation. API key system enables CLI automation while maintaining security.

### Data Storage Solutions

**Primary Database: MongoDB**
- **Connection:** MongoDB Atlas cloud instance
- **ODM:** Mongoose for schema validation and query building

**User Schema:**
```typescript
{
  email: String (unique, lowercase)
  password: String (bcrypt hashed)
  isAdmin: Boolean
  isVerified: Boolean
  verificationOTP: String
  otpExpiry: Date
  sapphireBalance: Number
  dailyClaimed: Number (0-10 daily limit)
  lastClaimDate: Date
}
```

**Bot Schema:**
```typescript
{
  userId: ObjectId (reference to User)
  containerName: String
  phone: String
  prefix: String
  sessionId: String
  serverId: Number (Pterodactyl ID)
  status: String (running/stopped/deploying)
  createdAt: Date
}
```

**Drizzle Configuration Present:** The project includes Drizzle ORM configuration (`drizzle.config.ts`) and a basic PostgreSQL schema (`shared/schema.ts`), but the application currently uses MongoDB exclusively. The Drizzle setup appears to be template scaffolding not yet integrated.

**Rationale:** MongoDB chosen for flexible document structure suitable for varying bot configurations. Mongoose provides TypeScript typings and validation. Future PostgreSQL migration may be planned (evidenced by Drizzle config).

### Authentication & Authorization

**Authentication Flow:**
1. User signs up with email/password
2. Password hashed with bcrypt (10 rounds)
3. 6-digit OTP generated and emailed via Gmail SMTP
4. OTP expires after 10 minutes
5. Upon verification, user gains full platform access
6. Sessions stored server-side with user ID reference

**Authorization Levels:**
- **Regular User:** Can create/manage own bots, claim sapphires
- **Admin:** Additional access to admin dashboard showing all users and containers

**Session Management:**
- Express-session with connect-pg-simple (PostgreSQL session store configured but not actively used)
- Session cookie: HttpOnly, Secure (production), SameSite
- User ID stored in session for request authentication

**Rationale:** OTP email verification prevents spam accounts. Session-based auth simplifies server-side logout and session expiry. Admin flag enables privileged routes without complex RBAC.

## External Dependencies

### Third-Party Services

**Pterodactyl Panel Integration**
- **Purpose:** Container orchestration and management
- **URL:** `https://suzzy-tech.goodnesstechhost.xyz`
- **Authentication:** API key-based (ptla_* format)
- **Usage:** Creates game servers (Docker containers) for each bot deployment
- **API Endpoints Used:**
  - POST `/api/application/servers` - Create new server
  - Server configuration: Node.js 18 Docker image, 512MB RAM limit

**Gmail SMTP Service**
- **Purpose:** Transactional email for OTP verification
- **Provider:** Gmail with app-specific password
- **Account:** hphosting4@gmail.com
- **Usage:** Sends HTML-formatted verification codes to new users

**VPS Server (Configured but Unused)**
- **Host:** 138.197.183.57
- **Purpose:** Listed in config for potential direct Docker deployments
- **Status:** Credentials empty, suggests future direct server deployment option

**MongoDB Atlas**
- **Purpose:** Primary database
- **Cluster:** Horlatube cluster
- **Connection:** MongoDB+SRV protocol with retry writes enabled

### Key NPM Packages

**Frontend:**
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible component primitives (20+ packages)
- `wouter` - Lightweight routing
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `tailwindcss` + `autoprefixer` - Styling

**Backend:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `nodemailer` - Email sending
- `express-session` + `connect-pg-simple` - Session management

**Build Tools:**
- `vite` - Frontend build tool and dev server
- `esbuild` - Backend bundling for production
- `tsx` - TypeScript execution in development
- `drizzle-kit` - Database migration tool (configured for future use)

### GitHub Integration

**Bot Repository:**
- **URL:** `https://github.com/horlapookie/Horlapookie-bot`
- **Usage:** Auto-cloned by Pterodactyl during server creation
- **Startup:** `npm install && npm start`
- **Environment Variables:** PHONE_NUMBER, PREFIX, SESSION_ID injected at runtime

**Rationale:** Pterodactyl chosen for established container management with web UI. Gmail SMTP provides reliable delivery without dedicated mail server. GitHub integration enables version-controlled bot updates.