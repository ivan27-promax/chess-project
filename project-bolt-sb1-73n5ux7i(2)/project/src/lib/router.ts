import { useEffect, useState } from 'react';

function readPath(): string {
  const raw = window.location.hash.replace(/^#/, '');
  return raw.startsWith('/') ? raw : '/';
}

export function useHashPath(): string {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => {
      setPath(readPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function navigateTo(path: string): void {
  window.location.hash = path;
}
