const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
    token?: string
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
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

export const authApi = {
    register: (email: string, password: string) =>
        request<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    login: (email: string, password: string) =>
        request<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),
};

export const tasksApi = {
    list: (token: string) => request<Task[]>("/tasks/", {}, token),

    create: (token: string, input: TaskInput) =>
        request<Task>(
            "/tasks/",
            { method: "POST", body: JSON.stringify(input) },
            token
        ),

    update: (token: string, id: number, input: Partial<TaskInput>) =>
        request<Task>(
            `/tasks/${id}`,
            { method: "PUT", body: JSON.stringify(input) },
            token
        ),

    remove: (token: string, id: number) =>
        request<void>(`/tasks/${id}`, { method: "DELETE" }, token),
};

export { ApiError };