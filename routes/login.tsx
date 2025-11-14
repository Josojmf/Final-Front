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

    const requestOptions: RequestInit = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    };

    try {
      console.log(`[login] Attempting login for ${loginEmail}`);
      const response = await fetch(loginUrl, requestOptions);

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
      const secret = Deno.env.get("JWT_SECRET") ?? "backup";
      const token = jwt.sign({ email: loginEmail }, secret);
      const headers = new Headers();
      headers.set("location", "/videos");
      applyAuthCookie(headers, url, token);
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
  headers.set("location", `/login?error=${encodeURIComponent(errorMessage)}`);
  applyAuthCookie(headers, url, null);
  return new Response(null, {
    status: 303,
    headers,
  });
}

function applyAuthCookie(headers: Headers, url: URL, token: string | null) {
  if (token) {
    setCookie(headers, {
      name: "auth",
      value: token,
      sameSite: "Lax",
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      secure: url.protocol === "https:",
    });
    return;
  }

  setCookie(headers, {
    name: "auth",
    value: "",
    sameSite: "Lax",
    domain: url.hostname,
    path: "/",
    httpOnly: true,
    secure: url.protocol === "https:",
    maxAge: 0,
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
