/*
# Create 8squared chess club schema with strict access control

1. New Tables
- admin_users: the list of club owners/managers allowed into the admin area (filled manually).
- events: club events with bilingual title/description, dates, capacity, status and registration switch.
- event_registrations: people who signed up for an event (name, email, university, phone, confirmed/waitlisted/cancelled).
- membership_requests: club membership applications with a short skill survey.
- sponsors and event_sponsors: sponsors and the events they support.
- external_links: trusted external chess websites shown on the home page.
- site_content: editable home page texts in English and Arabic.
- rate_limits: internal counters used to slow down spam (no public access).

2. Security
- Row level security is enabled on every table.
- Visitors (anon) can only read published events, active sponsors, active links and site texts.
- Visitors cannot read, change or delete registrations or membership requests directly; they must use the secure submission functions created in the next migration.
- Admin-only tables and columns are limited with explicit grants and policies that check the admin list.
- Only the status column of requests and registrations can be changed by the admin.

3. Notes
- Email addresses are stored in lower case and must be unique per event.
- No destructive changes are made to existing data (the database was empty before this migration).
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON admin_users TO authenticated;

DROP POLICY IF EXISTS "admin_users_select_self" ON admin_users;
CREATE POLICY "admin_users_select_self" ON admin_users FOR SELECT
TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL CHECK (char_length(title_en) BETWEEN 2 AND 150),
  title_ar text CHECK (title_ar IS NULL OR char_length(title_ar) <= 150),
  description_en text CHECK (description_en IS NULL OR char_length(description_en) <= 4000),
  description_ar text CHECK (description_ar IS NULL OR char_length(description_ar) <= 4000),
  location_en text CHECK (location_en IS NULL OR char_length(location_en) <= 200),
  location_ar text CHECK (location_ar IS NULL OR char_length(location_ar) <= 200),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  capacity integer CHECK (capacity IS NULL OR capacity BETWEEN 1 AND 5000),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  registration_open boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS events_status_starts_idx ON events (status, starts_at);

CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description_en text CHECK (description_en IS NULL OR char_length(description_en) <= 500),
  description_ar text CHECK (description_ar IS NULL OR char_length(description_ar) <= 500),
  logo_url text CHECK (logo_url IS NULL OR logo_url ~* '^https://[^\s]+$'),
  website_url text CHECK (website_url IS NULL OR website_url ~* '^https://[^\s]+$'),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS event_sponsors (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, sponsor_id)
);

CREATE TABLE IF NOT EXISTS external_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_en text NOT NULL CHECK (char_length(label_en) BETWEEN 1 AND 100),
  label_ar text CHECK (label_ar IS NULL OR char_length(label_ar) <= 100),
  url text NOT NULL CHECK (url ~* '^https://[^\s]+$'),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY CHECK (key ~ '^[a-z_]{2,60}$'),
  value_en text NOT NULL DEFAULT '' CHECK (char_length(value_en) <= 4000),
  value_ar text NOT NULL DEFAULT '' CHECK (char_length(value_ar) <= 4000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS membership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254 AND email = lower(email) AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  university text NOT NULL CHECK (char_length(university) BETWEEN 2 AND 120),
  phone text CHECK (phone IS NULL OR phone ~ '^\+?[0-9 ()-]{6,25}$'),
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_playing text CHECK (years_playing IS NULL OR years_playing IN ('under_1', '1_3', '3_5', 'over_5')),
  fide_rating integer CHECK (fide_rating IS NULL OR fide_rating BETWEEN 0 AND 3000),
  interests text CHECK (interests IS NULL OR char_length(interests) <= 300),
  message text CHECK (message IS NULL OR char_length(message) <= 1000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'rejected', 'waitlisted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_requests_created_idx ON membership_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254 AND email = lower(email) AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  university text NOT NULL CHECK (char_length(university) BETWEEN 2 AND 120),
  phone text CHECK (phone IS NULL OR phone ~ '^\+?[0-9 ()-]{6,25}$'),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

CREATE INDEX IF NOT EXISTS event_registrations_event_status_idx ON event_registrations (event_id, status);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON events, sponsors, event_sponsors, external_links, site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON events, sponsors, event_sponsors, external_links, site_content TO authenticated;
GRANT SELECT, DELETE ON membership_requests, event_registrations TO authenticated;
GRANT UPDATE (status) ON membership_requests TO authenticated;
GRANT UPDATE (status, notes) ON event_registrations TO authenticated;

DROP POLICY IF EXISTS "events_public_read" ON events;
CREATE POLICY "events_public_read" ON events FOR SELECT
TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "events_admin_read" ON events;
CREATE POLICY "events_admin_read" ON events FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "events_admin_insert" ON events;
CREATE POLICY "events_admin_insert" ON events FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "events_admin_update" ON events;
CREATE POLICY "events_admin_update" ON events FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "events_admin_delete" ON events;
CREATE POLICY "events_admin_delete" ON events FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "sponsors_public_read" ON sponsors;
CREATE POLICY "sponsors_public_read" ON sponsors FOR SELECT
TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS "sponsors_admin_read" ON sponsors;
CREATE POLICY "sponsors_admin_read" ON sponsors FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "sponsors_admin_insert" ON sponsors;
CREATE POLICY "sponsors_admin_insert" ON sponsors FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "sponsors_admin_update" ON sponsors;
CREATE POLICY "sponsors_admin_update" ON sponsors FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "sponsors_admin_delete" ON sponsors;
CREATE POLICY "sponsors_admin_delete" ON sponsors FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "event_sponsors_public_read" ON event_sponsors;
CREATE POLICY "event_sponsors_public_read" ON event_sponsors FOR SELECT
TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM events e WHERE e.id = event_sponsors.event_id AND e.status = 'published')
);

DROP POLICY IF EXISTS "event_sponsors_admin_read" ON event_sponsors;
CREATE POLICY "event_sponsors_admin_read" ON event_sponsors FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "event_sponsors_admin_insert" ON event_sponsors;
CREATE POLICY "event_sponsors_admin_insert" ON event_sponsors FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "event_sponsors_admin_delete" ON event_sponsors;
CREATE POLICY "event_sponsors_admin_delete" ON event_sponsors FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "external_links_public_read" ON external_links;
CREATE POLICY "external_links_public_read" ON external_links FOR SELECT
TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS "external_links_admin_read" ON external_links;
CREATE POLICY "external_links_admin_read" ON external_links FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "external_links_admin_insert" ON external_links;
CREATE POLICY "external_links_admin_insert" ON external_links FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "external_links_admin_update" ON external_links;
CREATE POLICY "external_links_admin_update" ON external_links FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "external_links_admin_delete" ON external_links;
CREATE POLICY "external_links_admin_delete" ON external_links FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "site_content_public_read" ON site_content;
CREATE POLICY "site_content_public_read" ON site_content FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_content_admin_insert" ON site_content;
CREATE POLICY "site_content_admin_insert" ON site_content FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "site_content_admin_update" ON site_content;
CREATE POLICY "site_content_admin_update" ON site_content FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "site_content_admin_delete" ON site_content;
CREATE POLICY "site_content_admin_delete" ON site_content FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "membership_requests_admin_read" ON membership_requests;
CREATE POLICY "membership_requests_admin_read" ON membership_requests FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "membership_requests_admin_update" ON membership_requests;
CREATE POLICY "membership_requests_admin_update" ON membership_requests FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "membership_requests_admin_delete" ON membership_requests;
CREATE POLICY "membership_requests_admin_delete" ON membership_requests FOR DELETE
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "event_registrations_admin_read" ON event_registrations;
CREATE POLICY "event_registrations_admin_read" ON event_registrations FOR SELECT
TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "event_registrations_admin_update" ON event_registrations;
CREATE POLICY "event_registrations_admin_update" ON event_registrations FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "event_registrations_admin_delete" ON event_registrations;
CREATE POLICY "event_registrations_admin_delete" ON event_registrations FOR DELETE
TO authenticated USING (is_admin());
