import { Handlers, PageProps } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import RegisterForm from "../islands/RegisterForm.tsx";

const USERS_FILE = "./static/users.json";

type User = {
  name: string;
  email: string;
  password: string;
  favorites: string[];
};

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

async function writeUsers(users: User[]): Promise<void> {
  await Deno.writeTextFile(USERS_FILE, JSON.stringify(users, null, 2));
}

type RegisterPageData = { error?: string };

export const handler: Handlers<RegisterPageData> = {
  GET: (req, ctx) => {
    const url = new URL(req.url);
    const error = url.searchParams.get("error") || undefined;
    return ctx.render({ error });
  },
  POST: async (req, ctx) => {
    const form = await req.formData();
    const email = form.get("RegisterEmail")?.toString() || "";
    const password = form.get("RegisterPassword")?.toString() || "";
    const name = form.get("RegisterName")?.toString() || "";

    const url = new URL(req.url);

    if (!email || !password || !name) {
      const headers = new Headers();
      headers.set(
        "location",
        "/register?error=Por%20favor%2C%20completa%20todos%20los%20campos.",
      );
      return new Response(null, { status: 303, headers });
    }

    const users = await readUsers();
    if (users.some((u) => u.email === email)) {
      const headers = new Headers();
      headers.set(
        "location",
        "/register?error=El%20correo%20electrónico%20ya%20está%20registrado.",
      );
      return new Response(null, { status: 303, headers });
    }

    users.push({ name, email, password, favorites: [] });
    await writeUsers(users);

    const headers = new Headers();
    const secret = Deno.env.get("JWT_SECRET") || "backup";
    headers.set("location", "/videos");
    const token = jwt.sign({ email }, secret);
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
  },
};
function Page({ data }: PageProps<RegisterPageData>) {
  return (
    <main className="page page--auth">
      <div className="page__gradient" aria-hidden="true"></div>
      <RegisterForm errorMessage={data?.error} />
    </main>
  );
}
export default Page;
