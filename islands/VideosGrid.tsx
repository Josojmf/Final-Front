import { useEffect, useState } from "preact/hooks";
import Video, { VideoType } from "../components/Video.tsx";

export default function VideosGrid() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          console.error("Invalid data");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch videos", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="videos-grid" aria-live="polite">
        <p>Cargando videos...</p>
      </section>
    );
  }

  return (
    <section className="videos-grid" aria-live="polite">
      {videos.length === 0
        ? (
          <p className="videos-grid__empty">
            No hay videos disponibles en este momento.
          </p>
        )
        : videos.map((video) => <Video key={video.id} {...video} />)}
    </section>
  );
}
