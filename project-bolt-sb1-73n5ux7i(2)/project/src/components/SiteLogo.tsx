import { Crown } from 'lucide-react';

export function SiteLogo({ url, className }: { url: string | null; className: string }) {
  if (url) {
    return <img src={url} alt="" className={`${className} object-contain`} />;
  }
  return <Crown className={`${className} text-gold`} aria-hidden="true" />;
}
