# Asbury Outdoor Services — Dump Trailer Booking Platform
## Implementation Plan

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System & Visual Language](#2-design-system--visual-language)
3. [Tech Stack](#3-tech-stack)
4. [Project Architecture](#4-project-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Frontend Routes & Pages](#8-frontend-routes--pages)
9. [Module Breakdown](#9-module-breakdown)
10. [Development Phases](#10-development-phases)
11. [Deployment Strategy](#11-deployment-strategy)

---

## 1. Project Overview

A standalone booking platform for Asbury Outdoor Services' dump trailer rental business. This is separate from the existing Wix marketing site and provides full booking, payment, e-signature, and admin capabilities.

**Core Principle:** Everything revolves around a single `Reservation` object:

```
Customer → Reservation → Rental dates/package → Agreement → Payment → Trailer → Additional charges → Notifications
```

Every action references the same reservation ID / booking number. This is the single source of truth.

---

## 2. Design System & Visual Language

Extracted from [asburyoutdoorservices.com](https://www.asburyoutdoorservices.com/):

### Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Primary | `#1a1a2e` (dark navy/black) | Headers, primary text, footer bg |
| Secondary | `#f5f5f5` (light gray) | Section backgrounds, cards |
| Accent | `#4a7c59` (forest green) | CTAs, buttons, highlights, links |
| Accent Light | `#e8f5e9` (light green) | Hover states, success badges |
| White | `#ffffff` | Main backgrounds, cards |
| Text Dark | `#333333` | Body text |
| Text Light | `#666666` | Secondary text, captions |
| Error | `#d32f2f` | Errors, destructive actions |
| Warning | `#f57c00` | Warnings, pending states |
| Success | `#388e3c` | Success states, confirmations |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 (Hero) | Inter / system-ui | 700 | 2.5–3rem |
| H2 (Section) | Inter / system-ui | 700 | 2rem |
| H3 (Card) | Inter / system-ui | 600 | 1.25rem |
| Body | Inter / system-ui | 400 | 1rem |
| Small/Caption | Inter / system-ui | 400 | 0.875rem |
| Button | Inter / system-ui | 600 | 1rem |

### Design Patterns from Wix Site

- **Hero sections:** Full-width background image with centered text overlay, two CTA buttons
- **Service cards:** Image + title + description + "Learn More" link, displayed in 3-column grid
- **Trust badges:** 4-column row of icon + title + short description
- **CTA banners:** Full-width dark/green background with heading and buttons
- **Footer:** 4-column layout — logo + tagline, quick links, services, legal pages, contact info
- **Navigation:** Sticky header, logo left, nav links center, CTA button right
- **Consistent CTAs:** "Rent a Trailer" and "Get a Free Quote" appear on every page
- **Clean spacing:** Generous padding, clear visual hierarchy

### UI Component Patterns

- **Buttons:** Rounded corners (6px), solid fills, hover darkens
- **Cards:** White background, subtle shadow, rounded corners
- **Forms:** Clean input fields, labels above, validation inline
- **Tables:** Striped rows, sticky headers for admin
- **Modals:** Centered overlay, backdrop blur/dim
- **Badges:** Pill-shaped, color-coded by status
- **Calendar:** Month grid view, booked dates shaded red/gray, available green

---

## 3. Tech Stack

### Frontend — `client/`

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | **Next.js 14+ (App Router)** | SSR for SEO, fast page loads, React ecosystem |
| UI Library | **Tailwind CSS** | Utility-first, matches clean design, fast to build |
| Component Kit | **shadcn/ui** | Accessible, customizable, Tailwind-native |
| State Management | **Zustand** | Lightweight, simple store for booking flow |
| Forms | **React Hook Form + Zod** | Type-safe validation, great DX |
| Calendar | **react-day-picker** | Customizable date picker, disables booked dates |
| Payment | **Stripe Elements** (embedded) | PCI-compliant, no card data touches our server |
| E-Signature | **@splitbee/react-signature-pad** or **react-signature-canvas** | Canvas-based signature capture |
| HTTP Client | **fetch** (native) | No extra deps needed |
| Icons | **Lucide React** | Consistent, lightweight icon set |
| Hosting | **Cloudflare Pages** | Fast global CDN, automatic SSL, custom domains |

### Admin Frontend — `admin/`

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | **Next.js 14+ (App Router)** | Same framework, shared types |
| UI Library | **Tailwind CSS + shadcn/ui** | Consistent with client |
| Tables | **TanStack Table** | Powerful sorting, filtering, pagination |
| Calendar View | **react-big-calendar** or custom | Month view for booking overview |
| Charts | **Recharts** | Dashboard analytics |
| Hosting | **Cloudflare Pages** | Fast global CDN, automatic SSL, custom domains |

### Backend — `backend/`

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Runtime | **Node.js** | TypeScript throughout |
| Framework | **Express.js** or **Fastify** | Mature, well-documented |
| Database | **Supabase** (PostgreSQL) | Managed Postgres, Auth, Storage, Realtime, RLS built-in |
| DB Client | **@supabase/supabase-js** | Official SDK, type-safe queries |
| Cache | **Cloudflare Workers KV** or **Upstash Redis** | Serverless caching, session storage, booking holds, rate limiting |
| Payment | **Stripe SDK** | Payment processing, webhooks, customer portal |
| Email | **Resend** or **SendGrid** | Transactional emails |
| SMS | **Telnyx** | SMS notifications |
| E-Signature Storage | **Cloudinary** | Store signed PDFs/agreements, optimized delivery |
| Auth | **Supabase Auth** | Built-in admin auth, JWT tokens, RLS integration |
| Validation | **Zod** | Shared schemas between frontend/backend |
| PDF Generation | **@react-pdf/renderer** or **Puppeteer** | Generate signed agreement PDFs |
| ID Generation | **nanoid** | Unique booking numbers |
| Hosting | **Cloudflare Workers** | Serverless backend, low latency, global edge deployment |

### Shared — `shared/`

| Concern | Choice |
|---------|--------|
| Types | TypeScript interfaces/types |
| Validation schemas | Zod schemas |
| Constants | Status enums, pricing defaults |
| Utilities | Date formatting, calculations |

---

## 4. Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Next.js)                    │
│  Public-facing booking pages, customer reservation view  │
└──────────────────────┬──────────────────────────────────┘
                       │ API calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Cloudflare Workers)                │
│  REST API, business logic, payment processing, webhooks  │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
   ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
   │Supabase│ │Cloudflare│ │ Stripe │ │Cloudinary│
   │(DB/Auth)│ │ KV/Cache│ │(Pay)   │ │(Files)   │
   └────────┘ └─────────┘ └────────┘ └──────────┘
       ▲
       │ API calls
┌──────┴──────────────────────────────────────────────────┐
│                   ADMIN (Next.js)                        │
│  Dashboard, reservation management, settings             │
└─────────────────────────────────────────────────────────┘
```

**Cloudflare provides:** Edge computing (Workers), caching (KV), CDN, DDoS protection, and SSL.
**Supabase provides:** PostgreSQL database + Auth + RLS policies.
**Cloudinary provides:** File storage, image/PDF optimization, CDN delivery.
**Hosting:** Client + Admin on Cloudflare Pages, Backend on Cloudflare Workers.

### Data Flow — Customer Booking

```
1. Customer visits /book
2. Selects package (24h / 3d / 7d)
3. Picks dates → system checks availability (Cloudflare KV cache + Supabase query)
4. If available → 15-minute temporary hold created (Cloudflare KV with TTL)
5. Fills customer info form
6. Reviews booking summary
7. Signs rental agreement (canvas signature captured)
8. Redirected to Stripe Checkout (full payment upfront)
9. Stripe webhook confirms payment
10. Backend: reservation confirmed, hold released, booking number generated
11. Emails + SMS sent
12. Customer sees confirmation page with secure link
```

### Data Flow — Admin Management

```
1. Admin logs in → sees dashboard with all reservations
2. Can filter/search/sort reservations
3. Click into reservation → full details
4. Can add additional charges
5. Can send notifications
6. Can view/download signed agreements
7. Can cancel/refund reservations
8. Can configure pricing and settings
```

---

## 5. Folder Structure

```
asbury-o-s/
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   └── DEPLOYMENT.md
│
├── client/                          # Public booking frontend
│   ├── app/
│   │   ├── layout.tsx              # Root layout with header/footer
│   │   ├── page.tsx                # Landing/home page
│   │   ├── book/
│   │   │   ├── page.tsx            # Step 1: Package selection
│   │   │   ├── dates/
│   │   │   │   └── page.tsx        # Step 2: Date picker + availability
│   │   │   ├── info/
│   │   │   │   └── page.tsx        # Step 3: Customer info form
│   │   │   ├── review/
│   │   │   │   └── page.tsx        # Step 4: Booking summary
│   │   │   ├── agreement/
│   │   │   │   └── page.tsx        # Step 5: E-signature
│   │   │   ├── payment/
│   │   │   │   └── page.tsx        # Step 6: Stripe checkout
│   │   │   └── confirmation/
│   │   │       └── [bookingNumber]/
│   │   │           └── page.tsx    # Step 7: Confirmation page
│   │   ├── reservation/
│   │   │   └── [token]/
│   │   │       └── page.tsx        # Secure customer reservation view
│   │   ├── agreement/
│   │   │   └── page.tsx            # Public agreement terms page
│   │   └── api/                    # Next.js API routes (if needed)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── booking/
│   │   │   ├── PackageCard.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   └── StepIndicator.tsx
│   │   ├── agreement/
│   │   │   ├── AgreementContent.tsx
│   │   │   └── SignaturePad.tsx
│   │   ├── payment/
│   │   │   └── CheckoutForm.tsx
│   │   └── ui/                     # shadcn components
│   ├── lib/
│   │   ├── api.ts                  # API client functions
│   │   ├── types.ts                # Shared TypeScript types
│   │   ├── constants.ts            # Packages, statuses, etc.
│   │   ├── utils.ts                # Formatting, calculations
│   │   └── store.ts                # Zustand booking state
│   ├── public/
│   │   ├── images/
│   │   └── logo.svg
│   ├── styles/
│   │   └── globals.css
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                           # Admin dashboard frontend
│   ├── app/
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Overview stats
│   │   ├── reservations/
│   │   │   ├── page.tsx            # Reservation list
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Reservation detail
│   │   ├── customers/
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx            # Booking calendar view
│   │   ├── agreements/
│   │   │   └── page.tsx            # Signed agreements list
│   │   ├── pricing/
│   │   │   └── page.tsx            # Package pricing config
│   │   ├── charges/
│   │   │   └── page.tsx            # Additional charges management
│   │   ├── notifications/
│   │   │   └── page.tsx            # Notification history
│   │   └── settings/
│   │       └── page.tsx            # Admin settings
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── AdminHeader.tsx
│   │   ├── reservations/
│   │   │   ├── ReservationTable.tsx
│   │   │   ├── ReservationDetail.tsx
│   │   │   └── ReservationFilters.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   └── RecentBookings.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── auth.ts
│   └── package.json
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/            # Supabase SQL migrations
│   │   └── seed.sql               # Initial data (packages, settings)
│   ├── src/
│   │   ├── index.ts                # Entry point (Cloudflare Workers)
│   │   ├── worker.ts               # Cloudflare Worker handler
│   │   ├── config/
│   │   │   ├── supabase.ts         # Supabase client (DB + Auth)
│   │   │   ├── kv.ts               # Cloudflare Workers KV client
│   │   │   ├── cloudinary.ts       # Cloudinary config
│   │   │   ├── stripe.ts           # Stripe config
│   │   │   ├── email.ts            # Email service
│   │   │   └── sms.ts              # SMS service
│   │   ├── routes/
│   │   │   ├── bookings.ts         # Booking CRUD + flow
│   │   │   ├── availability.ts     # Calendar + availability
│   │   │   ├── payments.ts         # Payment processing
│   │   │   ├── webhooks.ts         # Stripe webhooks
│   │   │   ├── agreements.ts       # E-signature + agreement
│   │   │   ├── charges.ts          # Additional charges
│   │   │   ├── notifications.ts    # Email/SMS triggers
│   │   │   ├── customers.ts        # Customer management
│   │   │   ├── admin.ts            # Admin-only endpoints
│   │   │   └── settings.ts         # Pricing/config settings
│   │   ├── middleware/
│   │   │   ├── auth.ts             # Supabase JWT verification
│   │   │   ├── validate.ts         # Request validation
│   │   │   ├── rateLimit.ts        # Cloudflare KV rate limiting
│   │   │   └── errorHandler.ts     # Global error handler
│   │   ├── services/
│   │   │   ├── bookingService.ts   # Core booking logic
│   │   │   ├── availabilityService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── agreementService.ts
│   │   │   ├── chargeService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── pdfService.ts       # PDF generation
│   │   │   └── idGenerator.ts      # Booking/invoice numbers
│   │   ├── validators/
│   │   │   ├── booking.ts
│   │   │   ├── customer.ts
│   │   │   ├── payment.ts
│   │   │   └── charge.ts
│   │   └── types/
│   │       └── index.ts
│   ├── wrangler.toml               # Cloudflare Workers configuration
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   ├── types/
│   │   ├── reservation.ts
│   │   ├── customer.ts
│   │   ├── payment.ts
│   │   ├── agreement.ts
│   │   ├── charge.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── statuses.ts
│   │   ├── packages.ts
│   │   └── index.ts
│   └── utils/
│       ├── formatting.ts
│       └── validation.ts
│
├── wrangler.toml                  # Cloudflare Workers config (root)
├── .env.example
├── .gitignore
├── package.json                    # Monorepo root (if using workspaces)
└── README.md
```

---

## 6. Database Schema

### Core Tables

```sql
-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================
-- TRAILERS
-- ============================================
CREATE TABLE trailers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- RENTAL PACKAGES
-- ============================================
CREATE TABLE rental_packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,          -- '24 Hours', '3 Days', '7 Days'
    slug            VARCHAR(50) UNIQUE NOT NULL,     -- '24h', '3d', '7d'
    duration_hours  INT NOT NULL,                    -- 24, 72, 168
    base_price_cents INT NOT NULL,                   -- 22500, 40000, 60000
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- RESERVATIONS (Central object)
-- ============================================
CREATE TABLE reservations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number      VARCHAR(20) UNIQUE NOT NULL,   -- 'AOS-2026-XXXX'
    invoice_number      VARCHAR(20) UNIQUE,             -- 'INV-2026-XXXX'

    -- Customer reference
    customer_id         UUID NOT NULL REFERENCES customers(id),

    -- Trailer reference
    trailer_id          UUID NOT NULL REFERENCES trailers(id),

    -- Package reference
    package_id          UUID NOT NULL REFERENCES rental_packages(id),

    -- Dates
    rental_start_date   DATE NOT NULL,
    rental_end_date     DATE NOT NULL,                  -- Calculated from package
    pickup_date         DATE NOT NULL,                  -- End date

    -- Pricing
    base_price_cents    INT NOT NULL,
    total_charges_cents INT DEFAULT 0,
    total_refunded_cents INT DEFAULT 0,
    amount_due_cents    INT NOT NULL,                   -- base_price + additional charges

    -- Delivery
    delivery_address    TEXT NOT NULL,

    -- Statuses
    booking_status      VARCHAR(30) DEFAULT 'pending',
        -- pending, awaiting_payment, confirmed, active, completed, cancelled, expired
    payment_status      VARCHAR(30) DEFAULT 'pending',
        -- pending, paid, failed, refunded, partially_refunded
    agreement_status    VARCHAR(30) DEFAULT 'not_started',
        -- not_started, pending_signature, signed

    -- Agreement
    agreement_version   VARCHAR(20),
    agreement_signed_at TIMESTAMP,
    agreement_token     VARCHAR(100) UNIQUE,            -- Secure link token
    signed_agreement_url TEXT,                           -- Cloudinary URL to PDF

    -- Reservation hold (Redis key reference)
    hold_expires_at     TIMESTAMP,

    -- Metadata
    notes               TEXT,                           -- Admin operational notes
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_booking_number ON reservations(booking_number);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_dates ON reservations(rental_start_date, rental_end_date);
CREATE INDEX idx_reservations_status ON reservations(booking_status);
CREATE INDEX idx_reservations_trailer_dates ON reservations(trailer_id, rental_start_date, rental_end_date);

-- ============================================
-- AGREEMENTS (Versioned)
-- ============================================
CREATE TABLE agreements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version         VARCHAR(20) NOT NULL,               -- '1.0', '1.1', '2.0'
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,                       -- HTML/Markdown of terms
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE signed_agreements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id  UUID NOT NULL REFERENCES reservations(id),
    agreement_id    UUID NOT NULL REFERENCES agreements(id),
    customer_name   VARCHAR(255) NOT NULL,
    signature_data  TEXT NOT NULL,                       -- Base64 signature image
    accepted_at     TIMESTAMP NOT NULL,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    pdf_url         TEXT,                                -- Generated PDF stored in Cloudinary
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signed_agreements_reservation ON signed_agreements(reservation_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id      UUID NOT NULL REFERENCES reservations(id),
    stripe_payment_id   VARCHAR(255),                    -- Stripe PaymentIntent ID
    stripe_session_id   VARCHAR(255),                    -- Stripe Checkout Session ID
    amount_cents        INT NOT NULL,
    currency            VARCHAR(3) DEFAULT 'usd',
    status              VARCHAR(30) DEFAULT 'pending',
        -- pending, successful, failed, refunded, partially_refunded
    payment_type        VARCHAR(30) NOT NULL,
        -- booking, additional_charge, refund
    charge_id           UUID REFERENCES additional_charges(id),
    metadata            JSONB,                           -- Extra payment data
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);

-- ============================================
-- ADDITIONAL CHARGES
-- ============================================
CREATE TABLE additional_charges (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id      UUID NOT NULL REFERENCES reservations(id),
    charge_type         VARCHAR(50) NOT NULL,
        -- overweight, extra_day, extra_mileage, failed_pickup,
        -- cleaning, damage, prohibited_material, custom
    description         TEXT,
    quantity            DECIMAL(10,2) DEFAULT 1,
    unit_price_cents    INT NOT NULL,
    total_cents         INT NOT NULL,
    status              VARCHAR(30) DEFAULT 'draft',
        -- draft, pending_payment, paid, failed, waived
    admin_notes         TEXT,
    created_by          UUID,                            -- Admin user ID
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_charges_reservation ON additional_charges(reservation_id);

-- ============================================
-- BOOKING STATUS HISTORY (Audit Trail)
-- ============================================
CREATE TABLE booking_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id  UUID NOT NULL REFERENCES reservations(id),
    action          VARCHAR(100) NOT NULL,               -- 'status_changed', 'payment_received', etc.
    old_value       TEXT,
    new_value       TEXT,
    performed_by    VARCHAR(255),                        -- 'system', 'admin:uuid', 'customer'
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_history_reservation ON booking_history(reservation_id);

-- ============================================
-- NOTIFICATIONS LOG
-- ============================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id  UUID NOT NULL REFERENCES reservations(id),
    type            VARCHAR(50) NOT NULL,                -- 'email', 'sms'
    template        VARCHAR(100) NOT NULL,               -- 'booking_confirmation', etc.
    recipient       VARCHAR(255) NOT NULL,               -- email or phone
    subject         TEXT,
    status          VARCHAR(30) DEFAULT 'queued',
        -- queued, sent, delivered, failed
    provider_id     VARCHAR(255),                        -- Resend/Telnyx message ID
    metadata        JSONB,
    sent_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_reservation ON notifications(reservation_id);

-- ============================================
-- ADMIN USERS (Managed via Supabase Auth)
-- ============================================
-- Admin users are created in Supabase Auth dashboard
-- This table stores additional profile data
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(30) DEFAULT 'admin',         -- 'admin', 'super_admin'
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SETTINGS (Key-value for flexible config)
-- ============================================
CREATE TABLE settings (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    updated_by      UUID REFERENCES admin_users(id),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Default settings rows:
-- package_24h_price: 22500
-- package_3d_price: 40000
-- package_7d_price: 60000
-- extra_day_price: 7500
-- extra_mile_price: 300
-- overweight_per_ton: 12500
-- failed_pickup_fee: 7500
-- cleaning_fee_max: 10000
-- included_miles: 50
-- booking_hold_minutes: 15
-- cancellation_policy: "..."
-- agreement_version: "1.0"
```

### Supabase Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

-- Admin policies (service role bypasses RLS)
CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Customer policies (via secure token, not auth)
-- Customers access reservations through API with booking_number + agreement_token
-- No direct Supabase auth for customers — they use our API endpoints
```

### Cloudinary Configuration

```typescript
// backend/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload signed agreement PDF
export async function uploadAgreementPDF(
  buffer: Buffer,
  bookingNumber: string
): Promise<string> {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'asbury-agreements',
        public_id: `agreement-${bookingNumber}`,
        resource_type: 'raw',    // PDFs use 'raw'
        format: 'pdf',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return (result as any).secure_url;
}

export default cloudinary;
```

### Key Relationships

```
customers 1───N reservations
trailers 1───N reservations
rental_packages 1───N reservations
reservations 1───1 signed_agreements
reservations 1───N payments
reservations 1───N additional_charges
reservations 1───N booking_history
reservations 1───N notifications
agreements 1───N signed_agreements
additional_charges 1───N payments (for charge payments)
```

### Overlapping Reservation Prevention

```sql
-- Prevent double-booking at DB level with exclusion constraint
-- (Requires PostgreSQL btree_gist extension)
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations ADD CONSTRAINT no_overlapping_reservations
    EXCLUDE USING gist (
        trailer_id WITH =,
        daterange(rental_start_date, rental_end_date, '[]') WITH &&
    ) WHERE (booking_status NOT IN ('cancelled', 'expired'));
```

---

## 7. API Endpoints

### Base URL: `/api/v1`

### Public Endpoints (Client)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/packages` | List available rental packages |
| `GET` | `/availability/check` | Check date availability for trailer |
| `POST` | `/bookings` | Create a new booking (creates hold) |
| `GET` | `/bookings/:bookingNumber` | Get booking details (customer-facing) |
| `POST` | `/bookings/:bookingNumber/agreement` | Submit signed agreement |
| `POST` | `/payments/create-checkout` | Create Stripe checkout session |
| `POST` | `/webhooks/stripe` | Stripe webhook receiver |
| `GET` | `/reservation/:token` | View reservation via secure token |
| `GET` | `/agreement` | Get current agreement terms |
| `GET` | `/agreement/:version` | Get specific agreement version |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Admin login |
| `POST` | `/auth/logout` | Admin logout |
| `GET` | `/admin/dashboard/stats` | Dashboard statistics |
| `GET` | `/admin/reservations` | List all reservations (with filters) |
| `GET` | `/admin/reservations/:id` | Get full reservation details |
| `PUT` | `/admin/reservations/:id` | Update reservation |
| `POST` | `/admin/reservations/:id/cancel` | Cancel reservation |
| `POST` | `/admin/reservations/:id/refund` | Process refund |
| `POST` | `/admin/reservations/:id/charges` | Add additional charge |
| `GET` | `/admin/reservations/:id/charges` | List charges for reservation |
| `GET` | `/admin/reservations/:id/payments` | Payment history |
| `GET` | `/admin/reservations/:id/history` | Audit trail |
| `GET` | `/admin/reservations/:id/notifications` | Notification history |
| `GET` | `/admin/calendar` | Calendar data (all bookings) |
| `GET` | `/admin/customers` | List customers |
| `GET` | `/admin/customers/:id` | Customer detail + history |
| `GET` | `/admin/agreements` | List signed agreements |
| `GET` | `/admin/agreements/:id` | View/download signed agreement |
| `GET` | `/admin/charges` | List all additional charges |
| `PUT` | `/admin/charges/:id` | Update charge |
| `PUT` | `/admin/charges/:id/waive` | Waive a charge |
| `GET` | `/admin/notifications` | Notification history |
| `POST` | `/admin/notifications/send` | Manually send notification |
| `GET` | `/admin/settings` | Get all settings |
| `PUT` | `/admin/settings` | Update settings |
| `PUT` | `/admin/settings/pricing` | Update pricing config |
| `GET` | `/admin/agreement-versions` | List agreement versions |
| `POST` | `/admin/agreement-versions` | Create new agreement version |

### Request/Response Examples

#### `POST /api/v1/bookings`
```json
// Request
{
  "packageSlug": "3d",
  "trailerId": "uuid",
  "rentalStartDate": "2026-09-10",
  "customer": {
    "fullName": "John Smith",
    "email": "john@example.com",
    "phone": "+13045551234",
    "deliveryAddress": "123 Main St, Charleston, WV 25301"
  }
}

// Response
{
  "success": true,
  "data": {
    "bookingNumber": "AOS-2026-0042",
    "holdExpiresAt": "2026-09-03T15:30:00Z",
    "rentalEndDate": "2026-09-13",
    "pickupDate": "2026-09-13",
    "basePriceCents": 40000,
    "totalDueCents": 40000,
    "package": {
      "name": "3 Days",
      "durationHours": 72
    }
  }
}
```

#### `GET /api/v1/availability/check?trailerId=uuid&startDate=2026-09-10&endDate=2026-09-13`
```json
{
  "success": true,
  "data": {
    "available": true,
    "trailerId": "uuid",
    "checkedDates": {
      "start": "2026-09-10",
      "end": "2026-09-13"
    }
  }
}
```

---

## 8. Frontend Routes & Pages

### Client Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with CTA to book |
| `/book` | Package Selection | Choose 24h/3d/7d package |
| `/book/dates` | Date Picker | Select rental start date, see availability |
| `/book/info` | Customer Info | Full name, phone, email, address |
| `/book/review` | Booking Summary | Review all details before payment |
| `/book/agreement` | E-Signature | Read & sign rental agreement |
| `/book/payment` | Payment | Stripe checkout (redirect) |
| `/book/confirmation/[bookingNumber]` | Confirmation | Success page after payment |
| `/reservation/[token]` | Reservation View | Secure customer portal for their booking |
| `/agreement` | Agreement Terms | Public page showing current rental agreement |

### Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Admin authentication |
| `/dashboard` | Dashboard | Stats overview, recent bookings |
| `/reservations` | Reservation List | All reservations with search/filter/sort |
| `/reservations/[id]` | Reservation Detail | Full reservation view + actions |
| `/calendar` | Booking Calendar | Month view of all bookings |
| `/customers` | Customers | Customer list and detail |
| `/agreements` | Agreements | Signed agreements list |
| `/charges` | Additional Charges | All charges across reservations |
| `/notifications` | Notifications | Notification history and manual send |
| `/pricing` | Pricing Config | Set package prices and fees |
| `/settings` | Settings | General admin settings |
| `/agreements/versions` | Agreement Versions | Manage agreement versions |

---

## 9. Module Breakdown

### Module 1: Booking Engine

**Responsibility:** Package selection, date calculation, booking number generation

```
Services:
  - getActivePackages()
  - calculateEndDate(startDate, package)
  - calculatePickupDate(endDate)
  - generateBookingNumber() → 'AOS-2026-XXXX'
  - generateInvoiceNumber() → 'INV-2026-XXXX'
  - createBookingHold(reservationId, ttlMinutes) → Redis key with TTL
  - releaseBookingHold(holdKey)
  - validateBookingHold(holdKey)
```

**Booking Number Format:** `AOS-YYYY-NNNN`
- `AOS` = Asbury Outdoor Services
- `YYYY` = Year
- `NNNN` = Sequential 4-digit number (resets yearly)

**Invoice Number Format:** `INV-YYYY-NNNN` (same pattern, separate sequence)

### Module 2: Availability Management

**Responsibility:** Calendar, availability checks, double-booking prevention

```
Services:
  - checkAvailability(trailerId, startDate, endDate) → boolean
  - getBookedDates(trailerId, month, year) → DateRange[]
  - getTrailerCalendar(trailerId, month, year) → CalendarDay[]
  - createReservationHold(reservationId, trailerId, dates, ttl)
  - releaseReservationHold(holdKey)
  - cleanupExpiredHolds() → cron job, releases holds past TTL
  - getAvailableDates(trailerId, month) → Date[]
```

**Hold Mechanism:**
1. When customer selects dates, create Cloudflare KV key: `hold:{trailerId}:{startDate}:{endDate}` with TTL
2. Hold TTL = 15 minutes (configurable)
3. If payment completes → hold becomes confirmed reservation
4. If TTL expires → hold released, dates available again
5. Background job cleans up expired holds every minute

### Module 3: Customer Management

**Responsibility:** Customer records and reservation lookup

```
Services:
  - findOrCreateCustomer(email, data) → Customer
  - getCustomerReservations(customerId) → Reservation[]
  - getCustomerByEmail(email) → Customer
```

### Module 4: E-Signature & Agreement

**Responsibility:** Agreement display, signature capture, PDF generation, audit trail

```
Services:
  - getActiveAgreement() → Agreement
  - getAgreementVersion(version) → Agreement
  - signAgreement(reservationId, customerName, signatureData, metadata) → SignedAgreement
  - generateAgreementPDF(signedAgreement) → upload to Cloudinary → PDF URL
  - getSignedAgreement(reservationId) → SignedAgreement
  - getAgreementHistory(reservationId) → SignedAgreement[]
```

**Agreement Flow:**
1. Display full agreement text on /book/agreement
2. Customer reads terms
3. Customer types name (matches booking name)
4. Customer draws signature on canvas
5. Customer checks "I accept" checkbox
6. Submit → signature data + name + timestamp + IP stored in Supabase
7. PDF generated asynchronously → uploaded to Cloudinary
8. Agreement status updated to `signed`
9. Can now proceed to payment

### Module 5: Payments

**Responsibility:** Stripe integration, payment processing, webhooks, refunds

```
Services:
  - createCheckoutSession(reservationId) → Stripe Session URL
  - handleWebhook(event) → process payment events
  - verifyPayment(paymentIntentId) → PaymentStatus
  - processRefund(paymentId, amountCents) → Refund
  - createChargePayment(chargeId) → Stripe Session URL
  - getPaymentHistory(reservationId) → Payment[]
```

**Webhook Events Handled:**
- `checkout.session.completed` → Confirm reservation, send notifications
- `payment_intent.payment_failed` → Mark payment failed, release hold
- `charge.refunded` → Update payment/refund status
- `checkout.session.expired` → Release hold, mark booking expired

**Payment Flow:**
1. Customer completes agreement → redirected to /book/payment
2. Backend creates Stripe Checkout Session with:
   - Line item: rental package price
   - Customer email
   - Metadata: reservation ID, booking number
   - Success URL: /book/confirmation/[bookingNumber]
   - Cancel URL: /book/review
3. Customer enters card details in Stripe-hosted page
4. Payment processes
5. Stripe sends webhook to /api/v1/webhooks/stripe
6. Backend verifies webhook signature
7. On success: reservation confirmed, notifications sent
8. On failure: reservation marked failed, hold released

### Module 6: Additional Charges

**Responsibility:** Post-booking charges, payment collection

```
Services:
  - createCharge(reservationId, chargeData) → AdditionalCharge
  - calculateChargeAmount(chargeType, quantity, settings) → amountCents
  - getChargesForReservation(reservationId) → AdditionalCharge[]
  - updateChargeStatus(chargeId, status)
  - waiveCharge(chargeId, adminId, reason)
  - initiateChargePayment(chargeId) → Stripe Session URL
  - getAllCharges(filters) → AdditionalCharge[]
```

**Charge Types & Auto-Calculation:**
| Type | Formula | Example |
|------|---------|---------|
| `overweight` | quantity (tons) × $125 | 2 tons = $250 |
| `extra_day` | quantity (days) × $75 | 2 days = $150 |
| `extra_mileage` | quantity (miles) × $3 | 10 miles = $30 |
| `failed_pickup` | flat $75 | $75 |
| `cleaning` | up to $100 (manual) | $75 |
| `damage` | manual entry | $200 |
| `prohibited_material` | manual entry | $150 |
| `custom` | manual entry | varies |

### Module 7: Notifications

**Responsibility:** Email and SMS sending

```
Services:
  - sendBookingConfirmation(reservationId) → email + SMS
  - sendPaymentFailed(reservationId) → email
  - sendAdditionalChargeNotice(chargeId) → email + SMS
  - sendChargePaymentConfirmation(chargeId) → email
  - sendBookingCancellation(reservationId) → email + SMS
  - sendBookingModification(reservationId) → email
  - logNotification(data) → Notification record
```

**Email Templates:**
| Template | Trigger | Content |
|----------|---------|---------|
| `booking_confirmation` | Payment success | Booking #, package, dates, address, amount, agreement link |
| `payment_failed` | Payment failure | Booking #, retry link |
| `additional_charge` | Charge created | Charge details, payment link |
| `charge_payment_confirmed` | Charge paid | Payment confirmation |
| `booking_cancellation` | Cancellation | Cancellation details, refund info |
| `booking_modified` | Modification | Updated details |

**SMS Content (Telnyx):**
- Short, essential info only
- Include link to /reservation/[token] for full details

### Module 8: Admin Dashboard

**Responsibility:** Reservation list, stats, management interface

```
Services:
  - getDashboardStats() → StatsCards data
  - getReservationsList(filters, pagination) → PaginatedResult
  - getReservationDetail(id) → Full reservation with all relations
  - searchReservations(query) → Reservation[]
  - getMonthlyBookingStats() → Chart data
```

### Module 9: Booking Management

**Responsibility:** Admin CRUD on reservations

```
Services:
  - updateReservation(id, data) → Reservation
  - cancelReservation(id, reason) → Reservation
  - refundReservation(id, amount, reason) → Refund
  - addOperationalNote(reservationId, note)
  - getBookingHistory(reservationId) → HistoryEntry[]
  - createManualReservation(data) → Reservation
```

### Module 10: Pricing Management

**Responsibility:** Dynamic pricing configuration

```
Services:
  - getPricingConfig() → PricingSettings
  - updatePackagePrice(slug, priceCents)
  - updateAdditionalChargeRate(type, rateCents)
  - updateIncludedMiles(miles)
  - getCurrentSettings() → all settings
  - updateSettings(settingsData)
```

### Module 11: Agreement Management

**Responsibility:** Agreement versioning and management

```
Services:
  - getAgreementVersions() → Agreement[]
  - createAgreementVersion(data) → Agreement
  - setActiveVersion(versionId)
  - getAgreementPdfUrl(signedAgreementId) → Cloudinary URL
```

### Module 12: Security

**Responsibility:** Authentication, authorization, fraud prevention

```
Middleware:
  - requireAuth (Supabase JWT verification)
  - rateLimit (per IP, per endpoint - Cloudflare Workers KV)
  - validateRequest (Zod schema validation)
  - csrfProtection
  - helmetHeaders (security headers)
  - webhookSignatureVerification (Stripe)

Protections:
  - Database exclusion constraint for overlapping dates
  - Supabase RLS policies (admin vs customer access)
  - Cloudflare Workers KV-based rate limiting
  - Booking hold TTL prevents stale holds
  - Webhook idempotency (prevent duplicate processing)
  - Secure reservation tokens (random, unguessable)
  - No raw card data storage (PCI compliance via Stripe)
  - Input validation on all endpoints
  - HTTPS enforcement
  - Cloudflare DDoS protection (automatic)
  - Cloudflare WAF rules (configurable)
```

---

## 10. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up monorepo structure
- [ ] Initialize Next.js client app
- [ ] Initialize Next.js admin app
- [ ] Initialize Express backend (for Cloudflare Workers)
- [ ] Create Supabase project (database + auth)
- [ ] Set up Supabase client libraries
- [ ] Set up Cloudinary account + config
- [ ] Set up Cloudflare Workers KV for caching
- [ ] Configure TypeScript across all packages
- [ ] Set up Tailwind + shadcn/ui
- [ ] Build shared types and constants
- [ ] Create database schema via Supabase SQL editor + migrations
- [ ] Set up RLS policies for admin/customer access
- [ ] Set up Cloudinary upload pipeline for agreements

### Phase 2: Core Booking Flow (Week 3-4)
- [ ] Package selection page (client)
- [ ] Date picker with availability check
- [ ] Customer info form
- [ ] Booking summary/review page
- [ ] Booking number generation
- [ ] Availability service + Redis holds
- [ ] Basic reservation CRUD API

### Phase 3: Payments (Week 5)
- [ ] Stripe integration (checkout sessions)
- [ ] Webhook handling
- [ ] Payment status tracking
- [ ] Booking confirmation flow
- [ ] Reservation confirmation page

### Phase 4: E-Signature (Week 6)
- [ ] Agreement content management
- [ ] Agreement display page
- [ ] Signature pad component
- [ ] Agreement signing API
- [ ] PDF generation
- [ ] Agreement upload to Cloudinary
- [ ] Agreement versioning

### Phase 5: Notifications (Week 7)
- [ ] Email service setup (Resend/SendGrid)
- [ ] SMS service setup (Telnyx)
- [ ] Email templates
- [ ] Booking confirmation emails
- [ ] Payment notifications
- [ ] Additional charge notifications
- [ ] Notification logging

### Phase 6: Admin Dashboard (Week 8-9)
- [ ] Admin authentication (Supabase Auth)
- [ ] Dashboard layout + sidebar
- [ ] Stats cards
- [ ] Reservation list with filters/sort/search
- [ ] Reservation detail page
- [ ] Booking calendar view
- [ ] Manual reservation creation

### Phase 7: Additional Features (Week 10-11)
- [ ] Additional charges CRUD
- [ ] Charge payment collection
- [ ] Admin settings page
- [ ] Pricing configuration
- [ ] Agreement version management
- [ ] Customer reservation portal
- [ ] Notification management

### Phase 8: Polish & Launch (Week 12)
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Deployment setup (Cloudflare Pages + Workers)
- [ ] Documentation

---

## 11. Deployment Strategy

### Cloudflare-First Architecture

**Everything hosted on Cloudflare** for maximum performance, security, and simplified billing:

| Service | Cloudflare Product | Notes |
|---------|-------------------|-------|
| Client Frontend | **Cloudflare Pages** | Static/SSR hosting, auto-deploy from git, custom domains |
| Admin Frontend | **Cloudflare Pages** | Separate Pages project, protected routes |
| Backend API | **Cloudflare Workers** | Serverless edge compute, runs Express/Fastify |
| Database + Auth | **Supabase** | Managed Postgres + Auth (not Cloudflare) |
| Cache/Session | **Cloudflare Workers KV** | Global key-value store for booking holds, rate limiting |
| File Storage | **Cloudinary** | Agreement PDFs, images, optimized delivery |
| CDN | **Cloudflare** | Built-in with Pages/Workers, global edge caching |
| DDoS Protection | **Cloudflare** | Automatic with all Cloudflare services |
| SSL/TLS | **Cloudflare** | Automatic HTTPS for all domains |
| DNS | **Cloudflare** | DNS management for all custom domains |

### Architecture Flow

```
Customer → Cloudflare DNS → Cloudflare Pages (Client)
                              ↓ API calls
Cloudflare Workers (Backend) ←→ Cloudflare KV (Cache)
                              ↓
                    Supabase (PostgreSQL + Auth)
                              ↓
                    Cloudinary (File Storage)
                              ↓
                    Stripe (Payment Processing)
```

### Why Cloudflare?

1. **Performance:** Edge computing means low latency worldwide
2. **Security:** Built-in DDoS protection, WAF, bot management
3. **Simplified Billing:** One dashboard for hosting, compute, CDN
4. **Developer Experience:** Wrangler CLI, instant deploys, built-in monitoring
5. **Scalability:** Auto-scales with traffic, no server management
6. **Cost-Effective:** Generous free tier, predictable pricing

### Deployment Commands

```bash
# Deploy Client to Cloudflare Pages
cd client
npm run build
npx wrangler pages deploy .next --project-name=asbury-client

# Deploy Admin to Cloudflare Pages
cd admin
npm run build
npx wrangler pages deploy .next --project-name=asbury-admin

# Deploy Backend to Cloudflare Workers
cd backend
npm run build
npx wrangler deploy
```

### Environment Variables (Cloudflare)

Set via Cloudflare dashboard or Wrangler secrets:

```bash
# Supabase
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Stripe
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PUBLISHABLE_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Cloudinary
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET

# Email (Resend)
wrangler secret put RESEND_API_KEY

# SMS (Telnyx)
wrangler secret put TELNYX_API_KEY
wrangler secret put TELNYX_PUBLIC_KEY
wrangler secret put TELNYX_PHONE_NUMBER
wrangler secret put ADMIN_PHONE_NUMBER

# Auth
wrangler secret put JWT_SECRET
```

### Cloudflare Pages Environment Variables

Set in Cloudflare Dashboard → Pages → Settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API
NEXT_PUBLIC_API_URL=https://api.asburyoutdoorservices.com
```

### Custom Domains

| Service | Domain | Provider |
|---------|--------|----------|
| Client | `asburyoutdoorservices.com` | Cloudflare DNS |
| Admin | `admin.asburyoutdoorservices.com` | Cloudflare DNS |
| API | `api.asburyoutdoorservices.com` | Cloudflare DNS |

### Alternative: Hybrid with Supabase Edge Functions

If Cloudflare Workers has limitations with certain Node.js libraries, consider:

| Service | Provider | Notes |
|---------|----------|-------|
| Client + Admin | Cloudflare Pages | Frontend hosting |
| Backend API | **Supabase Edge Functions** | Deno-based, runs alongside DB |
| Database + Auth | Supabase | Core platform |
| Cache | Cloudflare Workers KV | Still use Cloudflare for caching |
| File Storage | Cloudinary | Media delivery |

This hybrid approach keeps most services on Cloudflare while leveraging Supabase's serverless functions for backend logic that needs direct database access.

### Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis (Upstash for serverless or self-hosted)
REDIS_URL=redis://host:6379
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=bookings@asburyoutdoorservices.com

# SMS (Telnyx)
TELNYX_API_KEY=KEY...
TELNYX_PUBLIC_KEY=eu2zvPjhY6odxV34Z/EsRiERvTodkev4Fq0SlK90Izg=
TELNYX_PHONE_NUMBER=+13045550000
ADMIN_PHONE_NUMBER=+13045550001

# Auth
JWT_SECRET=...                    # For Supabase JWT verification
ADMIN_EMAIL=admin@asburyoutdoorservices.com
ADMIN_PASSWORD=...

# App
CLIENT_URL=https://asburyoutdoorservices.com
ADMIN_URL=https://admin.asburyoutdoorservices.com
API_URL=https://api.asburyoutdoorservices.com
NODE_ENV=development
```

---

## Appendix A: Status State Diagrams

### Booking Status
```
pending → awaiting_payment → confirmed → active → completed
   ↓            ↓                ↓          ↓
   └→ expired   └→ expired       └→ cancelled └→ cancelled
```

### Payment Status
```
pending → paid → (refunded / partially_refunded)
   ↓
   └→ failed
```

### Agreement Status
```
not_started → pending_signature → signed
```

### Additional Charge Status
```
draft → pending_payment → paid
   ↓         ↓
   └→ waived └→ failed
```

---

## Appendix B: Booking Number Algorithm

```typescript
import { nanoid } from 'nanoid';
import { supabase } from './config/supabase';

async function generateBookingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AOS-${year}-`;

  // Get the last booking number for this year
  const { data: lastBooking } = await supabase
    .from('reservations')
    .select('booking_number')
    .like('booking_number', `${prefix}%`)
    .order('booking_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastBooking) {
    const lastSeq = parseInt(lastBooking.booking_number.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}
```

---

*Last updated: September 3, 2026*
*Status: Planning — Ready for development*
*Hosting: Cloudflare (Pages + Workers + KV) + Cloudinary (File Storage)*

---

## Appendix C: Supabase Setup Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **Anon Key** (Settings → API)
3. Generate a **Service Role Key** (keep secret, backend only)

### 2. Run Database Migrations
Use the SQL Editor in Supabase dashboard to run the schema from Section 6.

### 3. Enable Extensions
```sql
-- Required for date overlap prevention
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

### 4. Set Up Auth
1. Go to Authentication → Providers
2. Enable **Email** provider (for admin login)
3. Create first admin user in Authentication → Users → Add User
4. After admin user exists, insert into `admin_users` table

### 5. Configure RLS
Run the RLS policies from the database schema section.
Test with Supabase client to verify admin can read/write all tables.

### 6. Supabase Client Config

```typescript
// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Service role client (backend only — bypasses RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auth client for admin verification
export const supabaseAuth = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### 7. Cloudflare Workers KV Config

```typescript
// backend/src/config/kv.ts
// For Cloudflare Workers, KV is accessed via environment bindings
// See wrangler.toml for KV namespace configuration

export interface Env {
  BOOKING_HOLDS: KVNamespace;
  // ... other bindings
}

// Usage in worker:
// export default {
//   async fetch(request: Request, env: Env): Promise<Response> {
//     const hold = await env.BOOKING_HOLDS.get('hold:trailer-1:2026-09-10:2026-09-13');
//     // ...
//   }
// }
```

### 7. Cloudflare Workers KV Config

```typescript
// backend/src/config/kv.ts
// For Cloudflare Workers, KV is accessed via environment bindings
// See wrangler.toml for KV namespace configuration

export interface Env {
  BOOKING_HOLDS: KVNamespace;
  // ... other bindings
}

// Usage in worker:
// export default {
//   async fetch(request: Request, env: Env): Promise<Response> {
//     const hold = await env.BOOKING_HOLDS.get('hold:trailer-1:2026-09-10:2026-09-13');
//     // ...
//   }
// }
```

### 8. Cloudflare R2 Config

```typescript
// backend/src/config/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = 'asbury-agreements';

export { r2Client, PutObjectCommand, GetObjectCommand, getSignedUrl };
```

---

## Appendix D: Cloudinary Setup Guide

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up (free tier)
2. Note your **Cloud Name**, **API Key**, **API Secret** (Dashboard)

### 2. Upload Folder Structure
Cloudinary will auto-create on first upload:
```
asbury-agreements/
  ├── agreement-AOS-2026-0001.pdf
  ├── agreement-AOS-2026-0002.pdf
  └── ...
```

### 3. Signed URL for Private PDFs (Optional)
If agreements should not be publicly accessible:
```typescript
// Generate signed URL (expires in 1 hour)
const signedUrl = cloudinary.url(publicId, {
  type: 'authenticated',
  sign_url: true,
  secure: true,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
});
```

---

## Appendix E: Cloudflare Pages Deployment

### 1. Connect Git Repository
1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Configure build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`

### 2. Environment Variables
Add environment variables in Pages settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL`

### 3. Custom Domains
1. Go to Pages project → Custom domains
2. Add your domain (e.g., `asburyoutdoorservices.com`)
3. Follow DNS configuration instructions

### 4. Deploy
Push to your connected branch (usually `main`) and Cloudflare Pages will automatically build and deploy.

---

## Appendix F: Cloudflare Workers Deployment

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Configure wrangler.toml
```toml
name = "asbury-backend"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

# KV Namespace for booking holds
[[kv_namespaces]]
binding = "BOOKING_HOLDS"
id = "your_kv_namespace_id"
```

### 3. Set Secrets
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET
# ... etc
```

### 4. Deploy
```bash
cd backend
wrangler deploy
```

### 5. Custom Domain
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to Settings → Triggers
4. Add custom domain (e.g., `api.asburyoutdoorservices.com`)
