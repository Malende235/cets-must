-- CETS Database Schema
-- Run with: psql -U postgres -d cets_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  "userID"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "fullName"         VARCHAR(255) NOT NULL,
  email              VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash"     VARCHAR(255) NOT NULL,
  role               VARCHAR(20) NOT NULL CHECK (role IN ('Student','Organizer','Administrator')),
  "accountStatus"    VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK ("accountStatus" IN ('Active','Inactive','Suspended')),
  "registrationDate" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  "categoryID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(100) UNIQUE NOT NULL
);

-- ─── EVENTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  "eventID"       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizerID"   UUID NOT NULL REFERENCES users("userID") ON DELETE CASCADE,
  "categoryID"    UUID NOT NULL REFERENCES categories("categoryID"),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  "eventDate"     DATE NOT NULL,
  "eventTime"     TIME NOT NULL,
  location        VARCHAR(255) NOT NULL,
  "ticketPrice"   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "totalCapacity" INT NOT NULL DEFAULT 100,
  "ticketsSold"   INT NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming','Ongoing','Cancelled','Completed')),
  "bannerImage"   VARCHAR(500),
  "createdDate"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  "transactionID"    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userID"           UUID NOT NULL REFERENCES users("userID") ON DELETE CASCADE,
  "eventID"          UUID NOT NULL REFERENCES events("eventID") ON DELETE CASCADE,
  "amountPaid"       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "paymentMethod"    VARCHAR(20) NOT NULL CHECK ("paymentMethod" IN ('Card','Mobile Money','Wallet')),
  "paymentStatus"    VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK ("paymentStatus" IN ('Success','Failed','Pending','Refunded')),
  "transactionDate"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "gatewayReference" VARCHAR(100),
  quantity           INT NOT NULL DEFAULT 1
);

-- ─── TICKETS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  "ticketID"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userID"            UUID NOT NULL REFERENCES users("userID") ON DELETE CASCADE,
  "eventID"           UUID NOT NULL REFERENCES events("eventID") ON DELETE CASCADE,
  "transactionID"     UUID REFERENCES transactions("transactionID") ON DELETE SET NULL,
  "bookingReference"  VARCHAR(20) UNIQUE NOT NULL,
  "purchaseTimestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ticketStatus"      VARCHAR(20) NOT NULL DEFAULT 'Valid' CHECK ("ticketStatus" IN ('Valid','Used','Cancelled','Refunded')),
  "qrCode"            TEXT,
  quantity            INT NOT NULL DEFAULT 1
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  "notificationID"   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userID"           UUID NOT NULL REFERENCES users("userID") ON DELETE CASCADE,
  "eventID"          UUID REFERENCES events("eventID") ON DELETE SET NULL,
  "notificationType" VARCHAR(30) NOT NULL CHECK ("notificationType" IN ('Confirmation','Cancellation','Event Update','Reminder')),
  message            TEXT,
  "isRead"           BOOLEAN NOT NULL DEFAULT FALSE,
  "sentTimestamp"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "deliveryStatus"   VARCHAR(20) NOT NULL DEFAULT 'Sent' CHECK ("deliveryStatus" IN ('Sent','Failed','Pending'))
);

-- ─── AUDIT LOGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  "logID"     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userID"    UUID REFERENCES users("userID") ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  details     TEXT,
  "ipAddress" VARCHAR(50),
  timestamp   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_status      ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date        ON events("eventDate");
CREATE INDEX IF NOT EXISTS idx_events_organizer   ON events("organizerID");
CREATE INDEX IF NOT EXISTS idx_tickets_user       ON tickets("userID");
CREATE INDEX IF NOT EXISTS idx_tickets_event      ON tickets("eventID");
CREATE INDEX IF NOT EXISTS idx_transactions_user  ON transactions("userID");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userID");
CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON audit_logs("userID");
CREATE INDEX IF NOT EXISTS idx_audit_logs_time    ON audit_logs(timestamp);
