-- ============================================
-- ADMIN AUTHENTICATION
-- ============================================
-- Emails permitted to create admin accounts
CREATE TABLE allowed_admin_emails (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed allowed emails
INSERT INTO allowed_admin_emails (email) VALUES
    ('fehkelvink@gmail.com');

-- Admin user profiles (credentials stored here, not in external auth provider)
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(30) DEFAULT 'admin',
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Index for fast email lookups during signup/login
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_allowed_admin_emails_email ON allowed_admin_emails(email);
