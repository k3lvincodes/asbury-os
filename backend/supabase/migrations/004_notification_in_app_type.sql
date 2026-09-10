-- Migration: Document in_app notification type
-- The notifications table already accepts any VARCHAR(50) value for `type`,
-- so no schema change is needed. This migration only updates the column comment
-- to reflect that 'in_app' is a valid type alongside 'email' and 'sms'.

COMMENT ON COLUMN notifications.type IS 'Notification channel: email, sms, or in_app';
