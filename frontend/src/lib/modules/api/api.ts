import { StatusCodes } from "http-status-codes";
import { clearToken, getToken } from "../storage/auth";
import { API_URL } from "../../enums/constants/api-url";
import { ApiError } from "../../enums/exception/api-error";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });


  if (!res.ok) {
    if (res.status === StatusCodes.UNAUTHORIZED) {
      clearToken();
    }

    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export { request };
