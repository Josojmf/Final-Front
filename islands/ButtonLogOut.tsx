import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";
import { setCookie } from "$std/http/cookie.ts";

const ButtonLogOut: FunctionComponent = () => {
  return (
    <div className="buttonLogOutContainer">
      <button className="buttonLogOut">
        LogOut
      </button>
    </div>
  );
};
export default ButtonLogOut;
