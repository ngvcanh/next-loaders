/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoaderServerSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface LoaderServerFailure {
  success: false;
  message: string;
  detail?: string;
  data?: null;
}

export type LoaderServerResponse<T> = LoaderServerSuccess<T> | LoaderServerFailure;

export interface LoaderServerAction<T, P = any> {
  (...args: P extends any[] ? P : P[]): Promise<LoaderServerResponse<T>>;
}

export interface ActionCallbacks<T> {
  onSuccess?(result: LoaderServerResponse<T>): void;
  onError?(e: unknown): void;
}

export interface ActionInferred<T, P = any> {
  (): Promise<void>;
  (...args: P extends never ? [] : [...(P extends any[] ? P : [P]), ActionCallbacks<T>?]): Promise<void>;
}

export interface LoaderInferred<P = any> {
  (): Promise<void>;
  (...args: P extends never ? [] :  [...(P extends any[] ? P : [P]), boolean?]): Promise<void>;
}
