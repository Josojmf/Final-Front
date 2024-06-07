import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

const LogInForm: FunctionComponent = () => {
  return (
    <div className="register-container">
      <h2>Log In</h2>
      <form action="/login" method="post">
        <input className="LoginEmailInput" name="LoginEmail" type="text">
        </input>
        <input
          className="LoginPasswordInput"
          name="LoginPassword"
          type="password"
        >
        </input>
        <button type="submit" className="LoginButton">Log In</button>
        <div>Don't have an account?</div> <a href="/register">Register</a>
      </form>
    </div>
  );
};
export default LogInForm;
