import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";
import ButtonLogOut from "../islands/ButtonLogOut.tsx";

const NavBar: FunctionComponent = () => {
  return (
    <div className="navBar">
      <ButtonLogOut></ButtonLogOut>
    </div>
  );
};
export default NavBar;
