/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionCallbacks, ActionInferred, LoaderServerAction } from "./types";
import useDebounce from "./use-debounce";
import useThrottle from "./use-throttle";

export interface CreateActionOptions {
  debounce?: number;
  throttle?: number;
}

export type ActionProgress = 'idle' | 'loading' | 'success' | 'error';

export default function createAction<T, P = never>(
  action: LoaderServerAction<T, P>,
  options?: CreateActionOptions
) {
  return function useAction(props?: ActionCallbacks<T>) {
    const {
      debounce: debounceTime = 0,
      throttle: throttleTime = 200,
    } = options || {};

    const {
      onSuccess,
      onError,
      onFinally,
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

    const execute: ActionInferred<T, P> = useCallback(async (
      ...params
    ) => {
      const callbacks = Array.isArray(params) && params.length > 1
        ? params.pop() as ActionCallbacks<T>
        : undefined;

      cancel();
      setProgress('loading');
      setState(true);
      abortControllerRef.current = new AbortController();

      try {
        const args = [...(Array.isArray(params) ? params : [params]), abortControllerRef.current.signal as P];
        const result = await action(...args as any);
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
        onFinally?.();
        callbacks?.onFinally?.();
      };
    }, [cancel, onSuccess, onError, onFinally]);

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
