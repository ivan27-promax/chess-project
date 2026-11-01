import { fetchSiteContent } from '@/lib/publicApi';
import { useAsyncData } from '@/lib/useAsyncData';
import { isSafeHttpsUrl } from '@/lib/validation';

export const SITE_LOGO_KEY = 'site_logo';

export function useSiteLogo(): string | null {
  const content = useAsyncData(fetchSiteContent, []);
  const value = content.data?.find((item) => item.key === SITE_LOGO_KEY)?.value_en.trim() ?? '';
  return value && isSafeHttpsUrl(value) ? value : null;
}
