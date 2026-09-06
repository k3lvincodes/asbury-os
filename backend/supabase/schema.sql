-- ============================================
-- ASBURY OUTDOOR SERVICES - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable btree_gist for date overlap prevention
CREATE EXTENSION IF NOT EXISTS btree_gist;

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
    base_price_cents INT NOT NULL,                   -- 22500, 37500, 67500
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

    -- Reservation hold (KV key reference)
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
    provider_id     VARCHAR(255),                        -- SendGrid/Twilio message ID
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
-- package_3d_price: 37500
-- package_7d_price: 67500
-- extra_day_price: 7500
-- extra_mile_price: 300
-- overweight_per_ton: 12500
-- failed_pickup_fee: 7500
-- cleaning_fee_max: 10000
-- included_miles: 50
-- booking_hold_minutes: 15
-- cancellation_policy: "..."
-- agreement_version: "1.0"

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

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

-- ============================================
-- OVERLAPPING RESERVATION PREVENTION
-- ============================================

-- Prevent double-booking at DB level with exclusion constraint
ALTER TABLE reservations ADD CONSTRAINT no_overlapping_reservations
    EXCLUDE USING gist (
        trailer_id WITH =,
        daterange(rental_start_date, rental_end_date, '[]') WITH &&
    ) WHERE (booking_status NOT IN ('cancelled', 'expired'));
