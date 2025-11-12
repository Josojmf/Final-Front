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
    const apiUrl = Deno.env.get("API_URL") ?? "https://videoapp-api.deno.dev";
    const loginUrl = `${apiUrl}/checkuser`;
    const form = await req.formData();
    const loginEmail = form.get("LoginEmail")?.toString() ?? "";
    const loginPassword = form.get("LoginPassword")?.toString() ?? "";
    const url = new URL(req.url);

    let errorMessage = AUTH_ERROR_GENERIC;

    try {
      console.log(`[login] Attempting login for ${loginEmail}`);
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (response.ok) {
        console.log(`[login] Authentication succeeded for ${loginEmail}`);
        const headers = new Headers();
        const secret = Deno.env.get("JWT_SECRET") ?? "backup";
        headers.set("location", "/videos");
        const token = jwt.sign({ email: loginEmail }, secret);
        setCookie(headers, {
          name: "auth",
          value: token,
          sameSite: "Lax",
          path: "/",
          httpOnly: true,
          secure: url.protocol === "https:",
        });
        return new Response(null, {
          status: 303,
          headers,
        });
      }

      console.warn(
        `[login] Authentication failed for ${loginEmail} with status ${response.status}`,
      );
      errorMessage =
        response.status === 401 || response.status === 404
          ? AUTH_ERROR_INVALID
          : AUTH_ERROR_SERVICE;
    } catch (error) {
      console.error("[login] Error while authenticating", error);
      errorMessage = AUTH_ERROR_NETWORK;
    }

    const headers = new Headers();
    setCookie(headers, {
      name: "auth",
      value: "",
      sameSite: "Lax",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: url.protocol === "https:",
    });
    headers.set("location", `/login?error=${encodeURIComponent(errorMessage)}`);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

function Page({ data }: PageProps<LoginPageData>) {
  return (
    <main className="page page--auth">
      <div className="page__gradient" aria-hidden="true"></div>
      <LogInForm errorMessage={data?.error} />
    </main>
  );
}

export default Page;
