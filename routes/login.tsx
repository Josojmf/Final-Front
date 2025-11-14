import { Handlers } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import LogInForm from "../islands/LogInForm.tsx";

export const handler: Handlers = {
  POST: async (req: Request) => {
    const APIURL = Deno.env.get("API_URL") || "https://videoapp-api.deno.dev";
    const loginurl = APIURL + "/checkuser";
    const form = await req.formData();
    const loginEmail = form.get("LoginEmail")?.toString() ?? "";
    const loginPassword = form.get("LoginPassword")?.toString() ?? "";
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

    const attemptHeaders = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    } satisfies RequestInit;

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
      const token = jwt.sign({ email: loginemail }, secret);
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
        headers: headers,
      });
    } else {
      const headers = new Headers();
      setCookie(headers, {
        name: "auth",
        value: "",
        sameSite: "Lax",
        domain: url.hostname,
        path: "/",
        maxAge: 0,
      });
      headers.set("location", "/login");
      return new Response(null, {
        status: 303,
        headers: headers,
      });

      if (response.ok) {
        console.log(`[login] Authentication succeeded for ${loginemail}`);
        const headers = new Headers();
        const secret = Deno.env.get("JWT_SECRET") || "backup";
        headers.set("location", "/videos");
        const token = jwt.sign({ email: loginemail }, secret);
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
          headers: headers,
        });
      }

      console.warn(
        `[login] Authentication failed for ${loginemail} with status ${response.status}`,
      );
      if (response.status === 401 || response.status === 404) {
        errorMessage = "Credenciales incorrectas. Revisa tu correo y contraseña.";
      } else {
        errorMessage =
          "El servicio de autenticación no respondió correctamente. Inténtalo más tarde.";
      }
    } catch (error) {
      console.error("[login] Error while authenticating", error);
      errorMessage =
        "No pudimos conectar con el servicio de autenticación. Inténtalo nuevamente.";
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
      headers: headers,
    });
  },
};
function Page({ data }: PageProps<LoginPageData>) {
  return (
    <main className="page page--auth">
      <div className="page__gradient" aria-hidden="true"></div>
      <LogInForm />
    </main>
  );
}

export default Page;
