import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

const LogInForm: FunctionComponent = () => {
  return (
    <section className="auth-card" aria-labelledby="login-title">
      <div className="auth-card__glow" aria-hidden="true"></div>
      <header className="auth-card__header">
        <h2 id="login-title">Bienvenido de nuevo</h2>
        <p>Ingresa tus credenciales para continuar inspirándote con nuevos videos.</p>
      </header>
      <form className="auth-card__form" action="/login" method="post">
        <label className="auth-card__label" htmlFor="login-email">
          Correo electrónico
        </label>
        <div className="auth-card__input-wrapper">
          <span className="auth-card__input-icon" aria-hidden="true">✉️</span>
          <input
            id="login-email"
            className="auth-card__input"
            name="LoginEmail"
            type="email"
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />
        </div>

        <label className="auth-card__label" htmlFor="login-password">
          Contraseña
        </label>
        <div className="auth-card__input-wrapper">
          <span className="auth-card__input-icon" aria-hidden="true">🔒</span>
          <input
            id="login-password"
            className="auth-card__input"
            name="LoginPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-card__button">
          Iniciar sesión
        </button>
        <p className="auth-card__support-text">
          ¿No tienes una cuenta?
          {" "}
          <a className="auth-card__link" href="/register">
            Regístrate gratis
          </a>
        </p>
      </form>
    </section>
  );
};
export default LogInForm;
