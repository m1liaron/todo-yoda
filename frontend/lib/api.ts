import { StatusCodes } from "http-status-codes";
import { clearToken, getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type User = {
  id: number;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Task = {
  id: number;
  title: string;
  done: boolean;
  priority: number;
  owner_id: number;
};

export type TaskInput = {
  title: string;
  done?: boolean;
  priority?: number;
};

export type TaskSortField = "id" | "title" | "priority" | "done";
export type SortOrder = "asc" | "desc";

export type TaskListParams = {
  page?: number;
  status?: boolean;
  sort?: TaskSortField;
  sortOrder?: SortOrder;
};

export type TaskListResponse = {
  data: Task[];
  has_more_pages: boolean;
  page_number: number;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

export const usersApi = {
  getMe: () => request<User>('/users/me', {}),
};

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const tasksApi = {
  list: (params: TaskListParams = {}) => {
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set("page", String(params.page));
    if (params.status !== undefined) search.set("status", String(params.status));
    if (params.sort !== undefined) search.set("sort", params.sort);
    if (params.sortOrder !== undefined) search.set("sortOrder", params.sortOrder);

    const qs = search.toString();
    return request<TaskListResponse>(`/tasks/${qs ? `?${qs}` : ""}`, {});
  },

  create: (input: TaskInput) =>
    request<Task>(
      '/tasks/',
      { method: 'POST', body: JSON.stringify(input) }
    ),

  update: (id: number, input: Partial<TaskInput>) =>
    request<Task>(
      `/tasks/${id}`,
      { method: 'PUT', body: JSON.stringify(input) }
    ),

  remove: (id: number) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

export { ApiError };
