import { Handlers } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import jwt from "npm:jsonwebtoken";

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

export const handler: Handlers = {
  POST: async (req) => {
    const { auth } = getCookies(req.headers);
    if (!auth) {
      return new Response(null, {
        status: 303,
        headers: { location: "/login" },
      });
    }

    const jwt_secret = Deno.env.get("JWT_SECRET") || "backup";
    let payload: any;
    try {
      payload = jwt.verify(auth, jwt_secret);
    } catch {
      return new Response(null, {
        status: 303,
        headers: { location: "/login" },
      });
    }

    const form = await req.formData();
    const videoId = form.get("videoId")?.toString();
    if (!videoId) {
      return new Response(null, {
        status: 303,
        headers: { location: "/videos" },
      });
    }

    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.email === payload.email);

    if (userIndex >= 0) {
      const favs = users[userIndex].favorites || [];
      if (favs.includes(videoId)) {
        users[userIndex].favorites = favs.filter((id) => id !== videoId);
      } else {
        favs.push(videoId);
      }
      await writeUsers(users);
    }

    return new Response(null, {
      status: 303,
      headers: { location: "/videos" },
    });
  },
};
