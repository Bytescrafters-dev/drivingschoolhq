import { getAccessTokenFromCookies } from "./cookies";
import { env } from "./env";

export async function proxyToBackend(
  req: Request,
  backendPath: string,
): Promise<Response> {
  const url = new URL(req.url);
  const target = `${env.BACKEND_URL}/${backendPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("host", new URL(env.BACKEND_URL).host); // avoid host issues
  headers.delete("cookie"); // don’t forward browser cookies to backend

  const accessToken = await getAccessTokenFromCookies();

  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const init: RequestInit = {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.clone().arrayBuffer()
        : undefined,
    redirect: "manual",
  };

  const res = await fetch(target, init);
  return res;
}

export async function proxyToBackendWithAccess(
  req: Request,
  backendPath: string,
  token: string,
): Promise<Response> {
  const url = new URL(req.url);
  const target = `${env.BACKEND_URL}/${backendPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("authorization", `Bearer ${token}`);
  headers.delete("cookie"); // don’t forward browser cookies to backend

  const init: RequestInit = {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.clone().arrayBuffer()
        : undefined,
    redirect: "manual",
  };

  const res = await fetch(target, init);
  return res;
}
