export type EventStatus = 'draft' | 'published' | 'archived';
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';
export type MembershipStatus = 'new' | 'accepted' | 'rejected' | 'waitlisted';
export type ChessLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type YearsPlaying = 'under_1' | '1_3' | '3_5' | 'over_5';

export type ClubEvent = {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  location_en: string | null;
  location_ar: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  status: EventStatus;
  registration_open: boolean;
  created_at: string;
};

export type Sponsor = {
  id: string;
  name: string;
  description_en: string | null;
  description_ar: string | null;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ExternalLink = {
  id: string;
  label_en: string;
  label_ar: string | null;
  url: string;
  sort_order: number;
  is_active: boolean;
};

export type SiteContentEntry = {
  key: string;
  value_en: string;
  value_ar: string;
};

export type MembershipRequest = {
  id: string;
  full_name: string;
  email: string;
  university: string;
  phone: string | null;
  level: ChessLevel;
  years_playing: YearsPlaying | null;
  fide_rating: number | null;
  interests: string | null;
  message: string | null;
  status: MembershipStatus;
  created_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  university: string;
  phone: string | null;
  status: RegistrationStatus;
  notes: string | null;
  created_at: string;
};
