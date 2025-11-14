import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

export type VideoType = {
  title: string;
  thumbnail: string;
  description: string;
  duration: number;
  youtubeid: string;
  date: string;
  id: string;
  fav: boolean;
};

const formatDuration = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Video: FunctionComponent<VideoType> = ({
  title,
  thumbnail,
  description,
  duration,
  youtubeid,
  date,
  fav,
}) => {
  const parsedDate = date ? new Date(date) : null;
  const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "";
  const formattedDuration = formatDuration(duration);
  const videoUrl = youtubeid ? `https://www.youtube.com/watch?v=${youtubeid}` : undefined;

  return (
    <article className="video-card">
      <div className="video-card__media">
        {videoUrl
          ? (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="video-card__thumbnail-link"
              aria-label={`Ver ${title} en YouTube`}
            >
              <img className="video-card__thumbnail" src={thumbnail} alt={title} />
            </a>
          )
          : <img className="video-card__thumbnail" src={thumbnail} alt={title} />}
        {formattedDuration && (
          <span className="video-card__duration">{formattedDuration}</span>
        )}
        {fav && <span className="video-card__badge">★ Favorito</span>}
      </div>
      <div className="video-card__content">
        <header className="video-card__header">
          <h2>{title}</h2>
          {formattedDate && <time dateTime={date}>{formattedDate}</time>}
        </header>
        <p className="video-card__description">{description}</p>
        {videoUrl && (
          <a
            className="video-card__cta"
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en YouTube
          </a>
        )}
      </div>
    </article>
  );
};
export default Video;
