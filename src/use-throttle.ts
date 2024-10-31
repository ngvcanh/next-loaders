/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";

export default function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastRun = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (delay <= 0 || Number.isNaN(delay) || !Number.isFinite(delay)) {
      callbackRef.current(...args);
      return;
    }

    if (now - lastRun.current >= delay) {
      callbackRef.current(...args);
      lastRun.current = now;
    } else {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [delay]);
}
