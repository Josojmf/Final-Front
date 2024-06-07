import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";
import ButtonLogOut from "../islands/ButtonLogOut.tsx";
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

const Video: FunctionComponent<VideoType> = (Video: VideoType) => {
  return (
    <div className="Video">
      {Video.title}
    </div>
  );
};
export default Video;
