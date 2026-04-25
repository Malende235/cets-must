-- CETS Seed Data
-- Run AFTER schema.sql

INSERT INTO categories (name) VALUES
  ('Academic'),
  ('Sports'),
  ('Cultural'),
  ('Club Activity'),
  ('Career & Professional'),
  ('Health & Wellness')
ON CONFLICT (name) DO NOTHING;

-- Demo Admin (password: Admin@1234)
INSERT INTO users ("fullName", email, "passwordHash", role, "accountStatus") VALUES (
  'System Administrator',
  'admin@must.ac.ug',
  '$2b$10$PUgnDz3isvCL2opcZDpS3OjvFVH03P1wbjpmDJCVgBj6IXpH03Zda',
  'Administrator',
  'Active'
) ON CONFLICT (email) DO NOTHING;

-- Demo Organizer (password: Org@1234)
INSERT INTO users ("fullName", email, "passwordHash", role, "accountStatus") VALUES (
  'Dr. Robert Mugisha',
  'organizer@must.ac.ug',
  '$2b$10$aLOAVptFkFBOAtbjsLGhXObDcyJdHgkHzSMtHxxtPEnsdbad2wbLi',
  'Organizer',
  'Active'
) ON CONFLICT (email) DO NOTHING;

-- Demo Student (password: Student@1234)
INSERT INTO users ("fullName", email, "passwordHash", role, "accountStatus") VALUES (
  'Janet Kyomugisha',
  'student@must.ac.ug',
  '$2b$10$NOvxz7xgC3ZDTrR94q9ns.0ZVzc0.M4Aoo22x6pq5DhRRfvvr/C8q',
  'Student',
  'Active'
) ON CONFLICT (email) DO NOTHING;
