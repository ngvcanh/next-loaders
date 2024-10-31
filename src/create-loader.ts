/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useContext, useMemo, useRef } from "react";
import { LoaderServerAction, LoaderServerResponse } from "./types";
import { LoaderContext } from "./providers";
import response from "./response";
import useDebounce from "./use-debounce";
import useThrottle from "./use-throttle";

export interface UseLoaderProps {
  retry?: number;
  delay?: number;
  debounce?: number;
  throttle?: number;
}

export type UseLoaderReturn<T> = [
  LoaderServerResponse<T> | null,
  {
    load(params?: any, force?: boolean): Promise<void>;
    cancel(): void;
    debounce(params?: any, force?: boolean): void;
    throttle(params?: any, force?: boolean): void;
  }
];

export default function createLoader<T>(name: string, action: LoaderServerAction<T>) {
  return function useLoader(props?: UseLoaderProps): UseLoaderReturn<T> {
    const {
      retry = 0,
      delay: delayTime = 0,
      debounce: debounceTime = 0,
      throttle: throttleTime = 200
    } = props || {};

    const context = useContext(LoaderContext);
    const abortControllerRef = useRef<AbortController>();
    const loaded = useRef(false);

    const result = context?.state?.[name] ?? null;

    if (!context) {
      throw new Error("useLoader must be used within a LoaderProvider");
    }

    const cancel = useCallback(() => {
      if (!abortControllerRef.current) {
        return;
      }

      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }, []);

    const load = useCallback(async (params?: any, force = false) => {
      if ((!loaded.current && !abortControllerRef.current) || force) {
        cancel();
        loaded.current = true;
        abortControllerRef.current = new AbortController();

        let currentRetry = 0;

        while (currentRetry <= retry) {
          try {
            const data = await action(params, abortControllerRef.current.signal);
            context.setLoader(data as LoaderServerResponse<T>, name);
            return;
          } catch (e) {
            if ((e as Error).name === "AbortError") {
              console.log("Request canceled");
              return;
            }

            currentRetry++;

            if (currentRetry === retry) {
              context.setLoader(response.error((e as Error).message), name);
              return;
            }

            await new Promise((resolve) => setTimeout(resolve, delayTime));
          }
        }
      }
    }, [cancel, context, delayTime, retry]);

    const debounce = useDebounce(load, debounceTime);
    const throttle = useThrottle(load, throttleTime);

    const loader = useMemo(() => ({
      load,
      cancel,
      debounce,
      throttle
    }), [load, cancel, debounce, throttle]);

    return [ result, loader ];
  }
}