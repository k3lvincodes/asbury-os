-- ============================================
-- CLEAR ALL DATA (EXCEPT ADMIN ACCOUNT)
-- Run this in the Supabase SQL Editor.
--
-- What this does:
--   * Deletes ALL booking/transaction data (customers, reservations,
--     payments, signed agreements, charges, notifications, history).
--   * Leaves admin_users and auth.users (admin account) untouched.
--   * Leaves reference/seed data intact (trailers, rental_packages,
--     agreements, settings) so the app keeps working.
--
-- To also reset reference data, see the OPTIONAL section at the bottom:
-- uncomment it, then re-run seed.sql.
-- ============================================

BEGIN;

-- Clear all transactional / booking data.
-- (CASCADE handles foreign keys; admin tables are NOT included.)
TRUNCATE TABLE
  signed_agreements,
  payments,
  additional_charges,
  booking_history,
  notifications,
  reservations,
  customers
CASCADE;

COMMIT;

-- ============================================
-- OPTIONAL: ALSO RESET REFERENCE / SEED DATA
-- Uncomment the block below to wipe trailers, packages,
-- agreements, and settings too, then re-run seed.sql
-- (backend/supabase/seed.sql) to restore them.
-- ============================================
-- BEGIN;
--   TRUNCATE TABLE
--     trailers,
--     rental_packages,
--     agreements,
--     settings
--   CASCADE;
-- COMMIT;