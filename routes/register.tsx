import { FreshContext, Handlers } from "$fresh/server.ts";
import jwt from "npm:jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import LogInForm from "../islands/LogInForm.tsx";
import RegisterForm from "../islands/RegisterForm.tsx";

export const handler: Handlers = {
  POST: async (req: Request, ctx: FreshContext) => {
    const APIURL = Deno.env.get("API_URL") || "https://videoapp-api.deno.dev";
    const loginurl = APIURL + "/register";
    const form = await req.formData();
    const email = form.get("RegisterEmail")?.toString() || "";
    const password = form.get("RegisterPassword")?.toString() || "";
    const name = form.get("RegisterName")?.toString() || "";

    const url = new URL(req.url);

    const response = await fetch(loginurl, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    if (response.status == 200) {
      const headers = new Headers();
      const secret = Deno.env.get("JWT_SECRET") || "backup";
      headers.set("location", "/videos");
      const token = jwt.sign({ password }, secret);
      setCookie(headers, {
        name: "auth",
        value: token,
        sameSite: "Lax",
        domain: url.hostname,
        path: "/",
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
      });
      headers.set("location", "/login");
      return new Response(null, {
        status: 303,
        headers: headers,
      });
    }
  },
};
function Page() {
  return (
    <div>
      <RegisterForm></RegisterForm>
    </div>
  );
}
export default Page;
