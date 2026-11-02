/*
# Add public seat counts for published events

1. New Function
- get_event_seat_counts: returns, for each published event, only the number of confirmed registrations.

2. Security
- Returns no names, emails or other personal details, so visitors can see availability without access to registrations.
- Runs with fixed search path and is granted only to visitors and signed-in users.
- Visitors cannot read the registrations table directly; this function is the only public path to counts.

3. Notes
- No table or data is changed by this migration.
*/

CREATE OR REPLACE FUNCTION get_event_seat_counts()
RETURNS TABLE (event_id uuid, confirmed_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, COUNT(r.id)::integer
  FROM events e
  LEFT JOIN event_registrations r
    ON r.event_id = e.id AND r.status = 'confirmed'
  WHERE e.status = 'published'
  GROUP BY e.id;
$$;

REVOKE EXECUTE ON FUNCTION get_event_seat_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_seat_counts() TO anon, authenticated;
