import { Handlers, PageProps } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import LogInForm from "../islands/LogInForm.tsx";

type LoginPageData = { error?: string };

type User = {
  name: string;
  email: string;
  password: string;
  favorites: string[];
};

const USERS_FILE = "./static/users.json";

async function readUsers(): Promise<User[]> {
  try {
    const text = await Deno.readTextFile(USERS_FILE);
    const users = JSON.parse(text);
    return users.map((u: any) => ({ ...u, favorites: u.favorites || [] }));
  } catch {
    return [{
      name: "Admin",
      email: "admin",
      password: "admin123",
      favorites: [],
    }];
  }
}

const AUTH_ERROR_GENERIC =
  "Ha ocurrido un error de autenticación. Por favor, revisa tus credenciales.";
const AUTH_ERROR_INVALID =
  "Credenciales incorrectas. Revisa tu correo y contraseña.";
const AUTH_ERROR_SERVICE =
  "El servicio de autenticación no respondió correctamente. Inténtalo más tarde.";

export const handler: Handlers = {
  GET: (req, ctx) => {
    const url = new URL(req.url);
    const error = url.searchParams.get("error") || undefined;
    return ctx.render({ error });
  },
  POST: async (req, ctx) => {
    const url = new URL(req.url);
    const form = await req.formData();
    const loginEmail = form.get("LoginEmail")?.toString() ?? "";
    const loginPassword = form.get("LoginPassword")?.toString() ?? "";

    if (!loginEmail || !loginPassword) {
      console.warn("[login] Missing credentials in form submission");
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
      headers.set(
        "location",
        `/login?error=${encodeURIComponent(AUTH_ERROR_GENERIC)}`,
      );
      return new Response(null, { status: 303, headers });
    }

    const users = await readUsers();
    const user = users.find((u) =>
      u.email === loginEmail && u.password === loginPassword
    );
    if (user) {
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
    } else {
      console.warn(`[login] Authentication failed for ${loginEmail}`);
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
      headers.set(
        "location",
        `/login?error=${encodeURIComponent(AUTH_ERROR_INVALID)}`,
      );
      return new Response(null, { status: 303, headers });
    }
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
