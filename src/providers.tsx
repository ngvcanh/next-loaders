/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, Dispatch, FC, PropsWithChildren, useMemo, useReducer } from "react";
import { LoaderServerResponse } from "./types";

export type LoaderState = Record<string, LoaderServerResponse<any>>;

export interface LoaderValue {
  state: LoaderState;
  setLoader(result: LoaderServerResponse<any>, name: string): void;
  reset(name: string): void;
  resetAll(): void;
}

export const initialState: LoaderState = {};

export const LoaderContext = createContext<LoaderValue>({
  state: initialState,
  setLoader: () => {},
  reset: () => {},
  resetAll: () => {},
});

export enum LoaderActionType {
  SET_LOADER = "SET_LOADER",
  RESET = "RESET",
  RESET_ALL = "RESET_ALL",
}

export interface LoaderSetLoaderAction {
  type: LoaderActionType.SET_LOADER;
  payload: LoaderServerResponse<any>;
  meta: string;
}

export interface LoaderResetAction {
  type: LoaderActionType.RESET;
  meta: string;
}

export interface LoaderResetAllAction {
  type: LoaderActionType.RESET_ALL;
}

export type LoaderAction = LoaderSetLoaderAction | LoaderResetAction | LoaderResetAllAction;

export const loaderReducer = (state: LoaderState = initialState, action: LoaderAction): LoaderState => {
  switch (action.type) {
    case LoaderActionType.SET_LOADER:
      return { ...state, [action.meta]: action.payload };
    case LoaderActionType.RESET:
      const { [action.meta]: _, ...rest } = state;
      return rest;
    case LoaderActionType.RESET_ALL:
      return initialState;
    default:
      return { ...state };
  }
};

export const createLoaderSlice = (dispatch: Dispatch<LoaderAction>) => {
  return {
    setLoader: (result: LoaderServerResponse<any>, name: string) => {
      dispatch({ type: LoaderActionType.SET_LOADER, payload: result, meta: name });
    },
    reset: (name: string) => {
      dispatch({ type: LoaderActionType.RESET, meta: name });
    },
    resetAll: () => {
      dispatch({ type: LoaderActionType.RESET_ALL });
    },
  };
};

const LoaderProvider: FC<PropsWithChildren<object>> = (props) => {
  const { children } = props;
  const [ state, dispatch ] = useReducer(loaderReducer, initialState);
  const slice = useMemo(() => createLoaderSlice(dispatch), []);

  return (
    <LoaderContext.Provider value={{ state, ...slice }}>
      {children}
    </LoaderContext.Provider>
  );
};

export default LoaderProvider;
