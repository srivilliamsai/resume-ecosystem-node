import { API_BASE_URL } from "@/config";
import type { Activity, LoginResponse, ResumeResponse, VerificationCase } from "./types";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const payload = body ? JSON.stringify(body) : undefined;
  if (payload) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: payload
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    const message = errorBody.error || errorBody.message || res.statusText;
    throw new Error(message || "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/token", "POST", { email, password });
  },
  async register(email: string, password: string, name?: string) {
    return request<{ id: string; email: string; name?: string }>("/auth/register", "POST", {
      email,
      password,
      name
    });
  }
};

export const activityApi = {
  async list(token: string): Promise<Activity[]> {
    return request<Activity[]>("/activities", "GET", undefined, token);
  },
  async create(
    token: string,
    payload: Pick<Activity, "title" | "type" | "org"> & { metadata?: Record<string, unknown> }
  ): Promise<Activity> {
    return request<Activity>("/activities", "POST", payload, token);
  },
  async verifyByHash(
    token: string,
    userId: string,
    activityId: string,
    expected: string,
    actual: string
  ): Promise<VerificationCase> {
    return request(`/verify/${activityId}/hash`, "POST", { expected, actual, userId }, token);
  }
};

export const resumeApi = {
  async rebuild(token: string): Promise<ResumeResponse | null> {
    await request<ResumeResponse["currentVersion"]>("/resume/rebuild", "POST", undefined, token);
    return resumeApi.current(token);
  },
  async current(token: string): Promise<ResumeResponse | null> {
    const response = await request<{ empty?: boolean } | ResumeResponse["currentVersion"] | null>(
      "/resume/me",
      "GET",
      undefined,
      token
    );

    if (!response || (typeof response === "object" && "empty" in response)) {
      return null;
    }

    return { currentVersion: response } as ResumeResponse;
  },
  async versions(token: string) {
    return request<ResumeResponse["versions"]>("/resume/versions", "GET", undefined, token);
  },
  async renderPdf(token: string, resumeVersionId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ resumeVersionId })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(errorBody || `Unable to render PDF (${res.status})`);
    }

    return res.blob();
  }
};
