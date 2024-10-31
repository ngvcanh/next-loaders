import { LoaderServerFailure, LoaderServerSuccess } from "./types";

const response = {
  success<T>(data: T, message?: string): LoaderServerSuccess<T> {
    return { success: true, data, message };
  },
  error(message: string, detail?: string): LoaderServerFailure {
    return { success: false, message, detail };
  }
};

export default response;
