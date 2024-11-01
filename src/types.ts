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
  (params?: P, signal?: AbortSignal): Promise<LoaderServerResponse<T>>;
}
