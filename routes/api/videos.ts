import { Handlers } from "$fresh/server.ts";

const USERS_FILE = "./static/users.json";

type User = {
  name: string;
  email: string;
  password: string;
  favorites: string[];
};

type VideoType = {
  title: string;
  thumbnail: string;
  description: string;
  duration: number;
  youtubeid: string;
  date: string;
  id: string;
  fav: boolean;
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

export const handler: Handlers = {
  GET: async (_req: any) => {
    try {
      const userEmail = _req?.state?.user;
      let userFavorites: string[] = [];
      if (userEmail) {
        const users = await readUsers();
        const user = users.find((u) => u.email === userEmail);
        userFavorites = user?.favorites || [];
      }

      const apiKey = Deno.env.get("YOUTUBE_API_KEY") || "AIzaSyDhsPmS0mvmFWASRyHQtZYRaaFtW1pxAsc";

      const searchUrl =
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&order=relevance&q=aprendizaje%20educación&key=${apiKey}`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(
          `YouTube API error: ${response.status} ${response.statusText}`,
        );
        return new Response(JSON.stringify({ error: "API error" }), { status: 500 });
      }

      const data = await response.json();

      if (data.error) {
        console.error("YouTube API error:", data.error.message);
        return new Response(JSON.stringify({ error: "API error" }), { status: 500 });
      }

      const videos: VideoType[] = data.items
        ?.filter((item: any) => item.id.videoId)
        .map((item: any) => ({
          id: item.id.videoId,
          youtubeid: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
          description: item.snippet.description,
          duration: 0,
          date: item.snippet.publishedAt,
          fav: userFavorites.includes(item.id.videoId),
        })) || [];

      return new Response(JSON.stringify(videos), {
        headers: { "content-type": "application/json" },
      });
    } catch (error) {
      console.error("Unexpected error loading videos", error);
      return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500 });
    }
  },
};
