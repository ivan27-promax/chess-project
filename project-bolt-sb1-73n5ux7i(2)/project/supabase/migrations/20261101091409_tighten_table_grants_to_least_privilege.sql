/*
# Tighten table grants to least privilege

1. Summary
- Removes the broad default table privileges that Supabase grants to the anon and authenticated roles.
- Re-grants only the exact verbs and columns the website and admin area use.

2. Public (anon) access
- Read only: events, sponsors, event_sponsors, external_links, site_content.
- Membership and event registration writes go through SECURITY DEFINER functions, so anon gets no table write access.
- rate_limits is internal and gets no access for anon or authenticated.

3. Admin (authenticated) access
- Read: events, sponsors, event_sponsors, external_links, site_content, membership_requests, event_registrations, admin_users (own row only, enforced by policy).
- Write on content tables: insert, update, delete, each still guarded by is_admin() policies.
- membership_requests: update restricted to the status column; delete allowed.
- event_registrations: update restricted to status and notes; delete allowed.

4. Security notes
- Row level security stays enabled on every table; these grants only decide which verbs a role may attempt.
- No table is granted to anon for writes.
*/

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

GRANT SELECT ON events, sponsors, event_sponsors, external_links, site_content TO anon;

GRANT SELECT ON events, sponsors, event_sponsors, external_links, site_content, membership_requests, event_registrations, admin_users TO authenticated;

GRANT INSERT, UPDATE, DELETE ON events, sponsors, external_links, site_content TO authenticated;

GRANT INSERT, DELETE ON event_sponsors TO authenticated;

GRANT UPDATE (status) ON membership_requests TO authenticated;

GRANT DELETE ON membership_requests TO authenticated;

GRANT UPDATE (status, notes) ON event_registrations TO authenticated;

GRANT DELETE ON event_registrations TO authenticated;
