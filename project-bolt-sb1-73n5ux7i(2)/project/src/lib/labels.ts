import type { TranslationKey } from '@/i18n/translations';
import type { ChessLevel, EventStatus, MembershipStatus, RegistrationStatus, YearsPlaying } from '@/types/club';

export const LEVEL_KEYS: Record<ChessLevel, TranslationKey> = {
  beginner: 'levelBeginner',
  intermediate: 'levelIntermediate',
  advanced: 'levelAdvanced',
  expert: 'levelExpert',
};

export const YEARS_KEYS: Record<YearsPlaying, TranslationKey> = {
  under_1: 'yearsUnder1',
  '1_3': 'years1to3',
  '3_5': 'years3to5',
  over_5: 'yearsOver5',
};

export const MEMBERSHIP_STATUS_KEYS: Record<MembershipStatus, TranslationKey> = {
  new: 'statusNew',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
  waitlisted: 'statusWaitlisted',
};

export const REGISTRATION_STATUS_KEYS: Record<RegistrationStatus, TranslationKey> = {
  confirmed: 'statusConfirmed',
  waitlisted: 'statusWaitlisted',
  cancelled: 'statusCancelled',
};

export const EVENT_STATUS_KEYS: Record<EventStatus, TranslationKey> = {
  draft: 'eventStatusDraft',
  published: 'eventStatusPublished',
  archived: 'eventStatusArchived',
};
