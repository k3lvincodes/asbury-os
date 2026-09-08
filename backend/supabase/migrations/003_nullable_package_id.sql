-- Make package_id nullable to support custom packages
ALTER TABLE reservations ALTER COLUMN package_id DROP NOT NULL;
