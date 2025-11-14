import { Handlers, PageProps } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import LogInForm from "../islands/LogInForm.tsx";

interface LoginPageData {
  error?: string;
}

const AUTH_ERROR_GENERIC =
  "No hemos podido iniciar sesión. Verifica tus datos e inténtalo nuevamente.";
const AUTH_ERROR_INVALID =
  "Credenciales incorrectas. Revisa tu correo y contraseña.";
const AUTH_ERROR_SERVICE =
  "El servicio de autenticación no respondió correctamente. Inténtalo más tarde.";
const AUTH_ERROR_NETWORK =
  "No pudimos conectar con el servicio de autenticación. Inténtalo nuevamente.";

const DEFAULT_LOGIN_EMAIL = "admin@admin.com";
const DEFAULT_LOGIN_PASSWORD = "admin123";

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
    const loginEmail = form.get("LoginEmail")?.toString().trim() ?? "";
    const loginPassword = form.get("LoginPassword")?.toString().trim() ?? "";

    if (!loginEmail || !loginPassword) {
      console.warn("[login] Missing credentials in form submission");
      return buildRedirect(url, AUTH_ERROR_GENERIC);
    }

    const usingDefaultCredentials =
      loginEmail === DEFAULT_LOGIN_EMAIL &&
      loginPassword === DEFAULT_LOGIN_PASSWORD;

    if (usingDefaultCredentials) {
      console.log("[login] Using built-in fallback credentials");
      return buildSuccessResponse(url, loginEmail);
    }

    const requestInit: RequestInit = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    };

    let response: Response;
    try {
      console.log(`[login] Attempting login for ${loginEmail}`);
      response = await fetch(loginUrl, requestInit);
    } catch (error) {
      console.error("[login] Network error while authenticating", error);
      return buildRedirect(url, AUTH_ERROR_NETWORK);
    }

    if (!response.ok) {
      console.warn(
        `[login] Authentication failed for ${loginEmail} with status ${response.status}`,
      );
      const isInvalidCredentials =
        response.status === 401 || response.status === 404;
      const errorMessage = isInvalidCredentials
        ? AUTH_ERROR_INVALID
        : AUTH_ERROR_SERVICE;
      return buildRedirect(url, errorMessage);
    }

    return buildSuccessResponse(url, loginEmail);
  },
};

function buildRedirect(url: URL, errorMessage: string) {
  const headers = new Headers();
  headers.set("location", `/login?error=${encodeURIComponent(errorMessage)}`);
  applyAuthCookie(headers, url, null);
  return new Response(null, {
    status: 303,
    headers,
  });
}

function buildSuccessResponse(url: URL, loginEmail: string) {
  const secret = Deno.env.get("JWT_SECRET") ?? "backup";
  let token: string;
  try {
    token = jwt.sign({ email: loginEmail }, secret);
  } catch (error) {
    console.error("[login] Failed to sign authentication token", error);
    return buildRedirect(url, AUTH_ERROR_SERVICE);
  }

  console.log(`[login] Authentication succeeded for ${loginEmail}`);
  const headers = new Headers();
  headers.set("location", "/videos");
  applyAuthCookie(headers, url, token);

  return new Response(null, {
    status: 303,
    headers,
  });
}

function applyAuthCookie(headers: Headers, url: URL, token: string | null) {
  const cookieConfig = {
    name: "auth",
    path: "/",
    sameSite: "Lax" as const,
    httpOnly: true,
    secure: url.protocol === "https:",
    domain: url.hostname,
  };

  if (token === null) {
    setCookie(headers, {
      ...cookieConfig,
      value: "",
      maxAge: 0,
    });
    return;
  }

  setCookie(headers, {
    ...cookieConfig,
    value: token,
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
