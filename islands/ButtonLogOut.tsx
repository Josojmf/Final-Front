import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";
import { setCookie } from "$std/http/cookie.ts";


const ButtonLogOut: FunctionComponent = () => {
  function deleteCookie() {
    const headers = new Headers();
    return new Response(null, {
      status: 303,
      headers: headers,
    });
    
  }
  return (
    <div className="buttonLogOutContainer">
      <button className="buttonLogOut" onClick={deleteCookie}>
        LogOut
      </button>
    </div>
  );
};
export default ButtonLogOut;
