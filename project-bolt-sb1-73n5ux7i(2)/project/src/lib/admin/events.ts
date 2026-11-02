import { supabase } from '@/lib/supabase';
import type { ClubEvent, EventStatus, ExternalLink, Sponsor } from '@/types/club';

export type EventDraft = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  locationEn: string;
  locationAr: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  status: EventStatus;
  registrationOpen: boolean;
};

const optional = (value: string) => (value.trim() ? value.trim() : null);

function toEventRow(draft: EventDraft) {
  const capacity = draft.capacity.trim();
  return {
    title_en: draft.titleEn.trim(),
    title_ar: optional(draft.titleAr),
    description_en: optional(draft.descriptionEn),
    description_ar: optional(draft.descriptionAr),
    location_en: optional(draft.locationEn),
    location_ar: optional(draft.locationAr),
    starts_at: new Date(draft.startsAt).toISOString(),
    ends_at: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
    capacity: capacity ? Number(capacity) : null,
    status: draft.status,
    registration_open: draft.registrationOpen,
  };
}

export async function listAdminEvents(): Promise<ClubEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export async function saveEvent(draft: EventDraft, id: string | null): Promise<string> {
  const row = toEventRow(draft);
  if (id) {
    const { data, error } = await supabase.from('events').update(row).eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Update was not applied');
    return id;
  }
  const { data, error } = await supabase.from('events').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function deleteEvent(id: string): Promise<void> {
  const { data, error } = await supabase.from('events').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Delete was not applied');
}

export async function listEventSponsorIds(eventId: string): Promise<string[]> {
  const { data, error } = await supabase.from('event_sponsors').select('sponsor_id').eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []).map((row) => row.sponsor_id);
}

export async function setEventSponsorIds(eventId: string, sponsorIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase.from('event_sponsors').delete().eq('event_id', eventId);
  if (deleteError) throw deleteError;
  if (sponsorIds.length === 0) return;
  const { error } = await supabase
    .from('event_sponsors')
    .insert(sponsorIds.map((sponsorId) => ({ event_id: eventId, sponsor_id: sponsorId })));
  if (error) throw error;
}

export async function listAdminSponsors(): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export type SponsorDraft = {
  name: string;
  descriptionEn: string;
  descriptionAr: string;
  logoUrl: string;
  websiteUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export async function saveSponsor(draft: SponsorDraft, id: string | null): Promise<void> {
  const row = {
    name: draft.name.trim(),
    description_en: optional(draft.descriptionEn),
    description_ar: optional(draft.descriptionAr),
    logo_url: optional(draft.logoUrl),
    website_url: optional(draft.websiteUrl),
    sort_order: draft.sortOrder,
    is_active: draft.isActive,
  };
  if (id) {
    const { data, error } = await supabase.from('sponsors').update(row).eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Update was not applied');
    return;
  }
  const { error } = await supabase.from('sponsors').insert(row);
  if (error) throw error;
}

export async function deleteSponsor(id: string): Promise<void> {
  const { data, error } = await supabase.from('sponsors').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Delete was not applied');
}

export async function listAdminLinks(): Promise<ExternalLink[]> {
  const { data, error } = await supabase
    .from('external_links')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export type LinkDraft = {
  labelEn: string;
  labelAr: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

export async function saveLink(draft: LinkDraft, id: string | null): Promise<void> {
  const row = {
    label_en: draft.labelEn.trim(),
    label_ar: optional(draft.labelAr),
    url: draft.url.trim(),
    sort_order: draft.sortOrder,
    is_active: draft.isActive,
  };
  if (id) {
    const { data, error } = await supabase.from('external_links').update(row).eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Update was not applied');
    return;
  }
  const { error } = await supabase.from('external_links').insert(row);
  if (error) throw error;
}

export async function deleteLink(id: string): Promise<void> {
  const { data, error } = await supabase.from('external_links').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Delete was not applied');
}
