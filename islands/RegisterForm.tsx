import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

const RegisterForm: FunctionComponent = () => {
  return (
    <div className="register-container">
      <h2>Register</h2>
      <form action="/register" method="post">
        <div>Full Name</div>
        <input className="RegisterNameInput" name="RegisterName" type="text">
        </input>
        <div>Email</div>
        <input className="RegisterEmailInput" name="RegisterEmail" type="text">
        </input>
        <div>Password</div>
        <input
          className="RegisterPasswordInput"
          name="RegisterPassword"
          type="password"
        >
        </input>
        <button type="submit" className="RegisterButton">Register</button>
        <div>Don't have an account?</div> <a href="/login"> Login</a>
      </form>
    </div>
  );
};
export default RegisterForm;
