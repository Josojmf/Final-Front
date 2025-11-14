import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import NavBar from "../components/NavBar.tsx";
import Video, { VideoType } from "../components/Video.tsx";

const FALLBACK_USER_ID = "664371ea54be82d8fdc2a6a9";

export const handler: Handlers = {
  GET: async (_req: Request, ctx: FreshContext) => {
    try {
      const apiBase = Deno.env.get("API_URL") ?? "https://videoapp-api.deno.dev";
      const url = `${apiBase}/videos/${FALLBACK_USER_ID}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
        return ctx.render([] as VideoType[]);
      }

      const data = await response.json() as VideoType[];
      return ctx.render(data);
    } catch (error) {
      console.error("Unexpected error loading videos", error);
      return ctx.render([] as VideoType[]);
    }
  },
};

const Page = (props: PageProps) => {
  const videosData = (props.data as VideoType[]) ?? [];
  return (
    <div className="page page--videos">
      <div className="page__gradient" aria-hidden="true"></div>
      <div className="videos-layout">
        <NavBar />
        <main className="videos-layout__content">
          <header className="videos-layout__header">
            <h1>Tu selección de aprendizaje</h1>
            <p>
              Descubre videos curados especialmente para potenciar tus habilidades. Guarda tus
              favoritos y vuelve cuando quieras.
            </p>
          </header>
          <section className="videos-grid" aria-live="polite">
            {videosData.length === 0
              ? <p className="videos-grid__empty">No hay videos disponibles en este momento.</p>
              : videosData.map((video) => <Video key={video.id} {...video} />)}
          </section>
        </main>
      </div>
    </div>
  );
};
export default Page;
