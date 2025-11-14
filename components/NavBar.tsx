import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";
import ButtonLogOut from "../islands/ButtonLogOut.tsx";

const NavBar: FunctionComponent = () => {
  return (
    <nav className="navBar">
      <div className="navBar__brand">
        <span className="navBar__logo" aria-hidden="true">🎬</span>
        <div>
          <p className="navBar__title">Final Front</p>
          <p className="navBar__subtitle">Explora, aprende y comparte</p>
        </div>
      </div>
      <ButtonLogOut />
    </nav>
  );
};
export default NavBar;
