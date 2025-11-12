import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

const ButtonLogOut: FunctionComponent = () => {
  return (
    <form className="buttonLogOutContainer" method="post" action="/logout">
      <button className="buttonLogOut" type="submit">
        <span className="buttonLogOut__icon" aria-hidden="true">🚪</span>
        <span className="buttonLogOut__label">Cerrar sesión</span>
      </button>
    </form>
  );
};
export default ButtonLogOut;
