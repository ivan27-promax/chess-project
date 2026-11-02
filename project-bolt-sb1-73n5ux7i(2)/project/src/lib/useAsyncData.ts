import { useEffect, useState } from 'react';

type AsyncState<T> = { data: T | null; error: boolean; loading: boolean };

export function useAsyncData<T>(loader: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: false, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: false }));
    loader()
      .then((data) => {
        if (active) setState({ data, error: false, loading: false });
      })
      .catch(() => {
        if (active) setState({ data: null, error: true, loading: false });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { ...state, reload: () => setVersion((value) => value + 1) };
}
