import { supabase } from '@/lib/supabase';

export async function saveSiteContent(key: string, valueEn: string, valueAr: string): Promise<void> {
  const { data, error } = await supabase
    .from('site_content')
    .update({ value_en: valueEn, value_ar: valueAr })
    .eq('key', key)
    .select('key');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Update was not applied');
}
