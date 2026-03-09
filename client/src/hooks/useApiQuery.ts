import { useEffect, useState, useCallback } from 'react';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiQuery<T>(queryFn: (() => Promise<T>) | null, deps: unknown[] = []): QueryState<T> {
  const [state, setState] = useState<{ data: T | null; isLoading: boolean; error: string | null }>({
    data: null,
    isLoading: true,
    error: null,
  });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

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
  }, [...deps, refetchTrigger]);

  return { ...state, refetch };
}
