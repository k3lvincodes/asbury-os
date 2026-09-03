-- ============================================
-- SEED DATA FOR ASBURY OUTDOOR SERVICES
-- ============================================

-- Insert rental packages
INSERT INTO rental_packages (name, slug, duration_hours, base_price_cents, sort_order)
VALUES
  ('24 Hours', '24h', 24, 22500, 1),
  ('3 Days', '3d', 72, 40000, 2),
  ('7 Days', '7d', 168, 60000, 3);

-- Insert default trailer
INSERT INTO trailers (name, description, is_active)
VALUES
  ('Dump Trailer 1', 'Standard dump trailer for residential and commercial use', true);

-- Insert default settings
INSERT INTO settings (key, value)
VALUES
  ('package_24h_price', '22500'),
  ('package_3d_price', '40000'),
  ('package_7d_price', '60000'),
  ('extra_day_price', '7500'),
  ('extra_mile_price', '300'),
  ('overweight_per_ton', '12500'),
  ('failed_pickup_fee', '7500'),
  ('cleaning_fee_max', '10000'),
  ('included_miles', '50'),
  ('booking_hold_minutes', '15'),
  ('cancellation_policy', 'Full refund if cancelled 24 hours before rental start. No refund for late cancellations.'),
  ('agreement_version', '1.0');

-- Insert initial agreement (version 1.0)
INSERT INTO agreements (version, title, content, is_active)
VALUES (
  '1.0',
  'Dump Trailer Rental Agreement',
  '<h1>Dump Trailer Rental Agreement</h1>
  <p>By signing this agreement, you agree to the following terms and conditions:</p>
  <h2>1. Rental Period</h2>
  <p>The rental period begins on the start date and ends on the scheduled return date. Extensions must be arranged in advance.</p>
  <h2>2. Usage</h2>
  <p>The trailer shall be used only for lawful purposes. The renter is responsible for any damage during the rental period.</p>
  <h2>3. Weight Limits</h2>
  <p>Do not exceed the maximum weight capacity. Overweight loads will incur additional charges.</p>
  <h2>4. Prohibited Materials</h2>
  <p>Hazardous materials, chemicals, and certain items are prohibited. Contact us for a complete list.</p>
  <h2>5. Insurance</h2>
  <p>Renter is responsible for insurance coverage during the rental period.</p>
  <h2>6. Late Returns</h2>
  <p>Late returns will incur additional daily charges. Please contact us if you need an extension.</p>',
  true
);
