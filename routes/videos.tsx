import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import NavBar from "../components/NavBar.tsx";
import ButtonLogOut from "../islands/ButtonLogOut.tsx";
import Video, { VideoType } from "../components/Video.tsx";

import axios from "npm:axios";
export const handler: Handlers = {
  GET: async (_req: Request, ctx: FreshContext) => {
    const userid = "000000000000000000000000";
    const url = Deno.env.get("API_URL") + "/videos/664371ea54be82d8fdc2a6a9" ||
      "https://videoapp-api.deno.dev/videos/664371ea54be82d8fdc2a6a9";
    const response = await axios.get(url);
    const data: VideoType[] = response.data as VideoType[];
    return ctx.render(data);
  },
};

const Page = (props: PageProps) => {
  const videosData = props.data as VideoType[];
  console.log(videosData);

  return (
    <div>
      <div className="NavBar">
        <NavBar></NavBar>
        <div className="VideosContainer">
          {videosData.map(function (video) {
            return (
              <div className="video">
                <h1>{video.title}</h1>
                <img src={video.thumbnail}></img>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Page;
