/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoaderServerAction, LoaderServerActionRequired, LoaderServerResponse } from "./types";
import useDebounce from "./use-debounce";
import useThrottle from "./use-throttle";

export interface CreateActionOptions {
  debounce?: number;
  throttle?: number;
}

export interface UseActionCallbacks<T> {
  onSuccess?(result: LoaderServerResponse<T>): void;
  onError?(e: unknown): void;
}

export type ActionProgress = 'idle' | 'loading' | 'success' | 'error';

export default function createAction<T, P = any>(
  action: LoaderServerAction<T, P> | LoaderServerActionRequired<T, P>,
  options?: CreateActionOptions
) {
  return function useAction(props?: UseActionCallbacks<T>) {
    const {
      debounce: debounceTime = 0,
      throttle: throttleTime = 200,
    } = options || {};

    const {
      onSuccess,
      onError,
    } = props || {};

    const [state, setState] = useState(false);
    const [progress, setProgress] = useState<ActionProgress>("idle");
    const abortControllerRef = useRef<AbortController | null>(null);

    const mounted = useRef(true);

    useEffect(() => {
      return () => {
        mounted.current = false;
      };
    }, []);

    const cancel = useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setProgress('idle');
        setState(false);
      }
    }, []);

    const execute = useCallback(async (params?: P, callbacks?: UseActionCallbacks<T>) => {
      cancel();
      setProgress('loading');
      setState(true);
      abortControllerRef.current = new AbortController();

      try {
        const result = await action(params as P, abortControllerRef.current.signal);
        setProgress('success');
        if (result.success) {
          onSuccess?.(result);
          callbacks?.onSuccess?.(result);
        } else {
          onError?.(result);
          callbacks?.onError?.(result);
        }
      } catch (e) {
        onError?.(e);
        callbacks?.onError?.(e);
        mounted.current && setProgress("error");
      } finally {
        mounted.current && setState(false);
      };
    }, [cancel, onSuccess, onError]);

    const debounce = useDebounce(execute, debounceTime);
    const throttle = useThrottle(execute, throttleTime);

    const actions = useMemo(() => ({
      execute,
      cancel,
      debounce,
      throttle,
      progress
    }), [cancel, execute, debounce, throttle, progress]);

    return [ actions, state ] as const;
  }
}
