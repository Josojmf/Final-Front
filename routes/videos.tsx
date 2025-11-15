import { PageProps } from "$fresh/server.ts";
import NavBar from "../components/NavBar.tsx";
import VideosGrid from "../islands/VideosGrid.tsx";

const Page = () => {
  return (
    <div className="page page--videos">
      <div className="page__gradient" aria-hidden="true"></div>
      <div className="videos-layout">
        <NavBar />
        <main className="videos-layout__content">
          <header className="videos-layout__header">
            <h1>Tu selección de aprendizaje</h1>
            <p>
              Descubre videos curados especialmente para potenciar tus
              habilidades. Guarda tus favoritos y vuelve cuando quieras.
            </p>
          </header>
          <VideosGrid />
        </main>
      </div>
    </div>
  );
};
export default Page;
