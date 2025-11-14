import { Handlers, PageProps } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import LogInForm from "../islands/LogInForm.tsx";

type LoginPageData = {
  error?: string;
};

const AUTH_ERROR_GENERIC =
  "No hemos podido iniciar sesión. Verifica tus datos e inténtalo nuevamente.";
const AUTH_ERROR_INVALID =
  "Credenciales incorrectas. Revisa tu correo y contraseña.";
const AUTH_ERROR_SERVICE =
  "El servicio de autenticación no respondió correctamente. Inténtalo más tarde.";
const AUTH_ERROR_NETWORK =
  "No pudimos conectar con el servicio de autenticación. Inténtalo nuevamente.";

export const handler: Handlers<LoginPageData> = {
  GET: (req, ctx) => {
    const url = new URL(req.url);
    const error = url.searchParams.get("error") ?? undefined;
    return ctx.render({ error });
  },
  POST: async (req: Request) => {
    const url = new URL(req.url);
    const apiUrl = Deno.env.get("API_URL") ?? "https://videoapp-api.deno.dev";
    const loginUrl = `${apiUrl}/checkuser`;
    const form = await req.formData();
    const loginEmail = form.get("LoginEmail")?.toString() ?? "";
    const loginPassword = form.get("LoginPassword")?.toString() ?? "";

    if (!loginEmail || !loginPassword) {
      console.warn("[login] Missing credentials in form submission");
      return buildRedirect(url, AUTH_ERROR_GENERIC);
    }

    const attemptHeaders: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    };

    try {
      console.log(`[login] Attempting login for ${loginEmail}`);
      const response = await fetch(loginUrl, attemptHeaders);

      if (!response.ok) {
        console.warn(
          `[login] Authentication failed for ${loginEmail} with status ${response.status}`,
        );
        const errorMessage =
          response.status === 401 || response.status === 404
            ? AUTH_ERROR_INVALID
            : AUTH_ERROR_SERVICE;
        return buildRedirect(url, errorMessage);
      }

      console.log(`[login] Authentication succeeded for ${loginEmail}`);
      const headers = new Headers();
      const secret = Deno.env.get("JWT_SECRET") ?? "backup";
      headers.set("location", "/videos");
      const token = jwt.sign({ email: loginEmail }, secret);
      applyAuthCookie(headers, token, url);
      return new Response(null, {
        status: 303,
        headers,
      });
    } catch (error) {
      console.error("[login] Error while authenticating", error);
      return buildRedirect(url, AUTH_ERROR_NETWORK);
    }
  },
};

function buildRedirect(url: URL, errorMessage: string) {
  const headers = new Headers();
  applyAuthCookie(headers, "", url, 0);
  headers.set("location", `/login?error=${encodeURIComponent(errorMessage)}`);
  return new Response(null, {
    status: 303,
    headers,
  });
}

function applyAuthCookie(
  headers: Headers,
  value: string,
  url: URL,
  maxAge?: number,
) {
  setCookie(headers, {
    name: "auth",
    value,
    sameSite: "Lax",
    domain: url.hostname,
    path: "/",
    maxAge,
    httpOnly: true,
    secure: url.protocol === "https:",
  });
}

function Page({ data }: PageProps<LoginPageData>) {
  return (
    <main className="page page--auth">
      <div className="page__gradient" aria-hidden="true"></div>
      <LogInForm errorMessage={data?.error} />
    </main>
  );
}

export default Page;
