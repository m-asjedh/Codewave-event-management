import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getOidcUserManager } from "@/lib/cognito-oidc";

export type ApiError = { status: number; message: string };

async function getIdToken(): Promise<string | undefined> {
  const mgr = getOidcUserManager();
  if (!mgr) return undefined;
  try {
    const user = await mgr.getUser();
    return user?.id_token;
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const base = getPublicApiBaseUrl();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");

  const { auth = true, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (auth) {
    const token = await getIdToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { ...rest, headers });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!res.ok) {
    const msg =
      typeof body === "object" && body && "error" in body
        ? String((body as { error: string }).error)
        : res.statusText;
    const err: ApiError = { status: res.status, message: msg };
    throw err;
  }

  return body as T;
}
