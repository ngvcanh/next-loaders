import { useContext } from "react";
import { LoaderContext } from "./providers";

export default function useResetLoader() {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error("useResetLoader must be used within a LoaderProvider");
  }

  return {
    reset: context.reset,
    resetAll: context.resetAll
  };
}