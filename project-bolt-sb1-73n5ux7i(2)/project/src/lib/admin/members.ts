import { supabase } from '@/lib/supabase';
import type { EventRegistration, MembershipRequest, MembershipStatus, RegistrationStatus } from '@/types/club';

export const PAGE_SIZE = 25;
export const EXPORT_LIMIT = 5000;

export type Page<T> = { rows: T[]; total: number };

export function sanitizeSearch(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s@._-]/gu, '').trim().slice(0, 100);
}

type ListOptions = { page: number; search: string; status: string };

export async function listMembershipRequests({ page, search, status }: ListOptions): Promise<Page<MembershipRequest>> {
  const from = page * PAGE_SIZE;
  let query = supabase
    .from('membership_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (status !== 'all') query = query.eq('status', status);
  const term = sanitizeSearch(search);
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function exportMembershipRequests(): Promise<MembershipRequest[]> {
  const { data, error } = await supabase
    .from('membership_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(EXPORT_LIMIT);
  if (error) throw error;
  return data ?? [];
}

export async function updateMembershipStatus(id: string, status: MembershipStatus): Promise<void> {
  const { data, error } = await supabase
    .from('membership_requests')
    .update({ status })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Update was not applied');
}

export async function deleteMembershipRequest(id: string): Promise<void> {
  const { data, error } = await supabase.from('membership_requests').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Delete was not applied');
}

type RegistrationOptions = { eventId: string; page: number; search: string; status: string };

export async function listRegistrations({ eventId, page, search, status }: RegistrationOptions): Promise<Page<EventRegistration>> {
  const from = page * PAGE_SIZE;
  let query = supabase
    .from('event_registrations')
    .select('*', { count: 'exact' })
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (status !== 'all') query = query.eq('status', status);
  const term = sanitizeSearch(search);
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function exportRegistrations(eventId: string): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .limit(EXPORT_LIMIT);
  if (error) throw error;
  return data ?? [];
}

export async function countConfirmedRegistrations(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from('event_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'confirmed');
  if (error) throw error;
  return count ?? 0;
}

export async function updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<void> {
  const { data, error } = await supabase
    .from('event_registrations')
    .update({ status })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Update was not applied');
}

export async function deleteRegistration(id: string): Promise<void> {
  const { data, error } = await supabase.from('event_registrations').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Delete was not applied');
}
