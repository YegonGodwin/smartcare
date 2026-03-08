import { useEffect, useState } from 'react';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApiQuery<T>(queryFn: (() => Promise<T>) | null, deps: unknown[] = []): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!queryFn) {
      setState({
        data: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let disposed = false;

    const run = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await queryFn();

        if (!disposed) {
          setState({
            data: result,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!disposed) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load data',
          });
        }
      }
    };

    void run();

    return () => {
      disposed = true;
    };
  }, deps);

  return state;
}
