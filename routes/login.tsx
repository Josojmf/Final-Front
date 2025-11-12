import { Handlers, PageProps } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import LogInForm from "../islands/LogInForm.tsx";

type LoginPageData = {
  error?: string;
};

export const handler: Handlers<LoginPageData> = {
  GET: (req, ctx) => {
    const url = new URL(req.url);
    const error = url.searchParams.get("error") ?? undefined;
    return ctx.render({ error });
  },
  POST: async (req: Request) => {
    const APIURL = Deno.env.get("API_URL") || "https://videoapp-api.deno.dev";
    const loginurl = APIURL + "/checkuser";
    const form = await req.formData();
    const loginemail = form.get("LoginEmail")?.toString() || "";
    const loginpassword = form.get("LoginPassword")?.toString() || "";
    const url = new URL(req.url);
    let errorMessage =
      "No hemos podido iniciar sesión. Verifica tus datos e inténtalo nuevamente.";
    try {
      console.log(`[login] Attempting login for ${loginemail}`);
      const response = await fetch(loginurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginemail,
          password: loginpassword,
        }),
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
      <LogInForm errorMessage={data?.error} />
    </main>
  );
}
export default Page;
