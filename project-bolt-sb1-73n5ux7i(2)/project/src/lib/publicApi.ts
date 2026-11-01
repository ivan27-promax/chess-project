import { supabase } from '@/lib/supabase';
import type { TranslationKey } from '@/i18n/translations';
import type { ClubEvent, ChessLevel, ExternalLink, RegistrationStatus, Sponsor, SiteContentEntry, YearsPlaying } from '@/types/club';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; errorKey: TranslationKey };

export function errorKeyFrom(error: { message?: string } | null): TranslationKey {
  const message = error?.message ?? '';
  if (message.includes('RATE_LIMITED')) return 'errRateLimited';
  if (message.includes('ALREADY_REGISTERED')) return 'errAlreadyRegistered';
  if (message.includes('EVENT_UNAVAILABLE')) return 'errEventUnavailable';
  return 'errGeneric';
}

export async function fetchPublishedEvents(): Promise<ClubEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('starts_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function fetchEventById(id: string): Promise<ClubEvent | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).eq('status', 'published').maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchEventSeatCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc('get_event_seat_counts');
  if (error) throw error;
  const rows = (data ?? []) as { event_id: string; confirmed_count: number }[];
  return Object.fromEntries(rows.map((row) => [row.event_id, row.confirmed_count]));
}

export async function fetchEventSponsors(eventId: string): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from('event_sponsors')
    .select('sponsor:sponsors(*)')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []).map((row) => row.sponsor as unknown as Sponsor).filter((sponsor) => sponsor?.is_active);
}

export async function fetchActiveSponsors(): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveLinks(): Promise<ExternalLink[]> {
  const { data, error } = await supabase
    .from('external_links')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSiteContent(): Promise<SiteContentEntry[]> {
  const { data, error } = await supabase.from('site_content').select('key, value_en, value_ar').limit(100);
  if (error) throw error;
  return data ?? [];
}

export type MembershipPayload = {
  fullName: string;
  email: string;
  university: string;
  phone: string;
  level: ChessLevel;
  yearsPlaying: YearsPlaying | '';
  fideRating: string;
  interests: string;
  message: string;
};

export async function submitMembershipRequest(payload: MembershipPayload): Promise<ActionResult<null>> {
  const { error } = await supabase.rpc('submit_membership_request', {
    p_full_name: payload.fullName,
    p_email: payload.email,
    p_university: payload.university,
    p_phone: payload.phone,
    p_level: payload.level,
    p_years_playing: payload.yearsPlaying,
    p_fide_rating: payload.fideRating.trim() ? Number(payload.fideRating) : null,
    p_interests: payload.interests,
    p_message: payload.message,
  });
  if (error) return { ok: false, errorKey: errorKeyFrom(error) };
  return { ok: true, data: null };
}

export type RegistrationPayload = {
  eventId: string;
  fullName: string;
  email: string;
  university: string;
  phone: string;
};

export async function registerForEvent(payload: RegistrationPayload): Promise<ActionResult<RegistrationStatus>> {
  const { data, error } = await supabase.rpc('register_for_event', {
    p_event_id: payload.eventId,
    p_full_name: payload.fullName,
    p_email: payload.email,
    p_university: payload.university,
    p_phone: payload.phone,
  });
  if (error) return { ok: false, errorKey: errorKeyFrom(error) };
  if (data !== 'confirmed' && data !== 'waitlisted') return { ok: false, errorKey: 'errGeneric' };
  return { ok: true, data };
}
