/* eslint-disable @typescript-eslint/no-explicit-any */
import createAction, { CreateActionOptions } from "./create-action";
import { ActionCallbacks, LoaderServerAction } from "./types";

export default function useAction<T, P = never>(
  action: LoaderServerAction<T, P>,
  options?: CreateActionOptions & ActionCallbacks<T>
) {
  const { onError, onSuccess, ...props } = options || {};
  return createAction<T, P>(action, props)({ onError, onSuccess });
}
