/* eslint-disable @typescript-eslint/no-explicit-any */
import createAction, { CreateActionOptions, UseActionCallbacks } from "./create-action";
import { LoaderServerAction } from "./types";

export default function useAction<T, P = any>(
  action: LoaderServerAction<T, P>,
  options?: CreateActionOptions & UseActionCallbacks<T>
) {
  const { onError, onSuccess, ...props } = options || {};
  return createAction<T, P>(action, props)({ onError, onSuccess });
}
