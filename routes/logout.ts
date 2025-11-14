import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";

async function clearAuthCookie(req: Request) {
  const headers = new Headers();
  const url = new URL(req.url);

  setCookie(headers, {
    name: "auth",
    value: "",
    path: "/",
    domain: url.hostname,
    sameSite: "Lax",
    maxAge: 0,
  });

  headers.set("location", "/login");

  return new Response(null, {
    status: 303,
    headers,
  });
}

export const handler: Handlers = {
  POST: clearAuthCookie,
  GET: clearAuthCookie,
};

export default function LogoutPage() {
  return null;
}
