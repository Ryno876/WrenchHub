# WrenchHub — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Summary:** A marketplace app where car owners post repair/maintenance jobs and mechanics bid competitively. Car owners can also browse mechanics directly. Like Uber for car repairs.

---

## 1. Overview

WrenchHub is a two-sided marketplace connecting car owners who need repairs or maintenance with mechanics who want new customers. It operates in two modes:

1. **Job Posting + Bidding** — Car owners post a job describing what they need. Mechanics submit sealed bids with detailed price breakdowns. The car owner reviews bids and picks the best fit based on price, ratings, distance, and mechanic profile.
2. **Browse + Direct Contact** — Car owners search and filter a directory of mechanics by specialty, location, rating, and verification status, then reach out directly via messaging.

**Launch market:** South Florida — Miami-Dade, Broward, and West Palm Beach counties.

**Revenue model:** Freemium for mechanics (free tier with limited bids, paid Pro tier with unlimited bids and premium features) + ads shown to car owners.

---

## 2. User Roles & Authentication

### Car Owner
- Signs up with email/password or OAuth (Google, Apple)
- Creates a profile: name, location (South Florida)
- Can save multiple vehicles: year, make, model, mileage

### Mechanic
- Signs up the same way as car owners
- Completes a mechanic profile:
  - Business name
  - Location / service area
  - Services offered (selected from categories)
  - Mobile mechanic, shop-based, or both
  - Photos of shop/work
  - Certifications (ASE, manufacturer-specific, etc.)
  - License and insurance info (for verification)
  - Years of experience

### Verification Tiers
- **Unverified** — Signed up, profile completed, can bid immediately
- **Verified** — Submitted business license, insurance, and/or ASE certifications. Manual admin review. Gets a verified badge displayed on profile and bids. Verified mechanics rank slightly higher in browse results.

### Auth System
- Email/password + OAuth (Google, Apple)
- JWT-based sessions
- Single auth system with a role flag (car_owner or mechanic)

---

## 3. Job Posting Flow (Car Owner)

### Step 1 — Select Vehicle
Car owner picks from saved vehicles or adds a new one (year, make, model, mileage).

### Step 2 — Categorize the Job
Guided selection from categories:
- **Maintenance** — oil change, tire rotation, brake pads, fluid flush, etc.
- **Repair** — engine, transmission, electrical, suspension, exhaust, etc.
- **Diagnostics** — check engine light, unusual noises, performance issues, etc.
- **Body Work** — dents, paint, bumper repair, glass, etc.
- **Other** — custom category

Each category has common sub-options to help structure the post.

### Step 3 — Describe the Problem
- Free-form text description
- Photo/video uploads (up to 5 files)
- **AI assist button** — Car owner describes symptoms in plain language (e.g., "my car shakes when I brake at high speed"). AI suggests a structured job title, likely category, and key details mechanics will want to know. Car owner can accept, edit, or ignore the suggestion.

### Step 4 — Set Preferences
- **Service type:** Mobile mechanic, shop, or no preference
- **Urgency:** Flexible, within a week, ASAP
- **Location:** Auto-filled from profile, adjustable

### Step 5 — Review & Post
Preview the listing, then publish. Job goes live and is visible to mechanics in the service area.

### Job Status Lifecycle
Draft → Active → Bidding (bids received) → Accepted (bid chosen) → Completed → Closed

---

## 4. Bidding System (Mechanic)

### Job Discovery
Mechanics see a feed of active jobs filtered by:
- Their service area (distance)
- Categories they've selected as specialties
- Mobile/shop preference match

Additional filters: urgency, vehicle type, distance radius.

### Submitting a Bid (Sealed)
- **Total price** — the bottom-line cost
- **Breakdown:**
  - Parts (itemized)
  - Labor (hours × rate)
  - Shop fees / supplies
  - Any other charges
- **Estimated completion time** — how long the job will take
- **Notes to car owner** — questions, clarifications, additional info
- **Availability** — when they can start

Bids are sealed — mechanics cannot see other mechanics' bids. Mechanics can update or withdraw their bid until the car owner accepts one.

### What the Car Owner Sees
A list of all bids on their job, each showing:
- Mechanic name, photo, rating, verified badge (if applicable)
- Distance from their location
- Total price + full breakdown
- Estimated completion time
- Mechanic's notes
- Link to full mechanic profile

Car owners can sort bids by price, rating, distance, or completion time. They can message a mechanic to ask questions before accepting.

### Accepting a Bid
- Car owner taps "Accept" on their chosen bid
- Winning mechanic is notified
- All other mechanics on that job are notified their bid was not selected
- Job status moves to "Accepted"

---

## 5. Browse Mechanics (Directory Mode)

Car owners can skip job posting and browse mechanics directly.

### Search & Filter
- **Location** — mechanics near them or within a radius
- **Category/specialty** — filter by service type
- **Service type** — mobile, shop, or both
- **Rating** — minimum star rating
- **Verification** — show only verified mechanics

### Results
- Mechanic cards showing: name, photo, rating, verified badge, distance, specialties, mobile/shop
- Sorted by relevance (distance + rating + verification status)
- Verified mechanics get subtle priority in results
- Pro tier mechanics can get featured placement (future)

### Direct Contact
- Car owner taps on a mechanic's profile to view full details
- "Message" button to start a conversation directly
- No job post required

---

## 6. Mechanic Profiles & Reviews

### Profile Page
- Business name, profile photo, cover photo
- Verified badge (if applicable)
- Location / service area (radius for mobile, address for shop)
- Mobile, shop, or both
- Services offered (categories)
- Years of experience
- Certifications (ASE, manufacturer-specific, etc.)
- Photo gallery of shop/work
- Average rating + total number of reviews
- Individual reviews from car owners

### Review System
- After a job is marked "Completed," the car owner is prompted to leave a review
- Star rating (1-5) + written review
- Reviews are tied to a specific job for context
- Mechanics can respond to reviews publicly
- Only car owners who completed a job with that mechanic can leave a review (prevents fake reviews)
- Browse-mode contacts: car owner can leave a review by confirming work was completed off-platform

---

## 7. Messaging

### Conversation Triggers
- Mechanic asks a question on a job they're bidding on
- Car owner messages a mechanic from a bid
- Car owner messages a mechanic from browse/directory mode

### Features
- Text messages
- Photo sharing (attach from camera or gallery)
- Push notifications for new messages (web push at MVP, mobile push in Phase 2)
- Conversation list showing all active threads
- Unread message indicators
- Conversations are tied to context: if started from a job, job details pinned at top; if from browse mode, mechanic profile linked

### Not at Launch
Video/voice calls, read receipts, typing indicators.

---

## 8. Revenue Model

### Mechanic Tiers

**Free Tier:**
- Profile listing in the directory
- Up to 5 bids per month
- Basic profile (limited photos, no featured placement)
- Standard messaging

**Pro Tier (paid monthly subscription, ~$29-49/month):**
- Unlimited bids
- Featured placement in browse results and job feeds
- Enhanced profile (unlimited photos, video showcase, priority badge)
- Analytics dashboard (profile views, bid win rate, response time stats)
- Early access to new job posts (15-minute head start before free tier)

### Ads
- Non-intrusive ads shown to car owners in the job feed and browse results
- Relevant advertisers: auto parts stores, dealerships, car insurance
- Banner and card-style placements, no pop-ups
- No ads for Pro mechanics in their own dashboard
- Future: promoted bids (mechanics pay to boost a specific bid)

### Car Owners
Always free. No paywalls on posting jobs, browsing, or messaging.

---

## 9. Technical Architecture

### Tech Stack
- **Web Frontend:** Next.js (React) with TypeScript — SSR for SEO
- **Mobile Frontend:** React Native with TypeScript via Expo
- **Backend API:** Node.js with Express, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Cache:** Redis — sessions, job feed caching, rate limiting
- **File Storage:** Cloudflare R2 — photos, videos, profile images (S3-compatible, no egress fees)
- **Real-time:** Socket.io — messaging and live notifications
- **AI:** Claude API — AI-assisted job posting
- **Validation:** Zod — shared schema validation between frontend and backend
- **Data Fetching:** TanStack Query — frontend caching and data fetching
- **State Management:** Zustand — lightweight client-side state

### Infrastructure
- **Web Hosting:** Vercel (Next.js)
- **API Hosting:** Railway (Node.js) — simple deployment, easy to manage
- **Mobile Builds:** Expo (simplifies iOS/Android builds and app store submissions)
- **Push Notifications:** Web push via service workers (MVP), Expo Push Notifications (Phase 2)

### Monorepo Structure (Turborepo)
```
wrenchhub/
├── apps/
│   ├── web/          # Next.js web app
│   ├── mobile/       # React Native (Expo) app
│   └── api/          # Node.js Express backend
├── packages/
│   ├── shared/       # Shared TypeScript types, validation schemas, utils
│   ├── ui/           # Shared UI components
│   └── db/           # Prisma schema, migrations, database client
```

### Key Data Models
- **User** — id, email, role (car_owner | mechanic), name, location, created_at
- **Vehicle** — id, owner_id, year, make, model, mileage
- **MechanicProfile** — id, user_id, business_name, location, service_area_radius, mobile/shop, services, certifications, photos, verified, subscription_tier
- **Job** — id, owner_id, vehicle_id, title, description, category, sub_category, photos, service_type_preference, urgency, location, status, created_at
- **Bid** — id, job_id, mechanic_id, total_price, parts_breakdown, labor_hours, labor_rate, fees, estimated_completion_time, notes, availability, status, created_at
- **Review** — id, job_id, mechanic_id, reviewer_id, rating (1-5), text, mechanic_response, created_at
- **Conversation** — id, job_id (nullable), participants, created_at
- **Message** — id, conversation_id, sender_id, text, photos, created_at

---

## 10. MVP Scope

### Phase 1 — MVP (Web Only)
- Car owner & mechanic sign-up/login (email + Google)
- Car owner vehicle management
- Mechanic profile creation (info, services, location, photos)
- Job posting with guided categories + free-form + photo uploads
- AI-assisted job description
- Mechanic job feed with filters (location, category, distance)
- Sealed bidding with detailed breakdowns
- Browse mechanics directory with filters
- Basic messaging with photo sharing
- Reviews after job completion
- Verified/unverified mechanic badges (manual admin verification)
- Free tier only (no paywall yet)
- Web app only

### Phase 2 — Mobile + Monetization
- React Native mobile apps (iOS + Android) via Expo
- Pro tier subscription + Stripe payment processing
- Ads integration
- Push notifications (mobile)
- Analytics dashboard for Pro mechanics
- In-app payments / escrow for jobs

---

## 11. Geographic Scope

**Launch:** South Florida — Miami-Dade, Broward, and West Palm Beach counties.

Jobs and mechanic searches are filtered by location. Mechanics set a service area radius. Car owners see only mechanics and jobs relevant to their area.

Expansion to other markets comes after validating the concept in South Florida.
