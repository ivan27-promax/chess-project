import { useAsyncData } from '@/lib/useAsyncData';
import { fetchEventSeatCounts, fetchPublishedEvents } from '@/lib/publicApi';

export function usePublicEvents() {
  return useAsyncData(async () => {
    const [events, counts] = await Promise.all([fetchPublishedEvents(), fetchEventSeatCounts()]);
    return { events, counts };
  }, []);
}
