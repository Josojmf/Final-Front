import { FunctionComponent } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

const RegisterForm: FunctionComponent<{ errorMessage?: string }> = (
  { errorMessage },
) => {
  return (
    <section className="auth-card" aria-labelledby="register-title">
      <div className="auth-card__glow" aria-hidden="true"></div>
      <header className="auth-card__header">
        <h2 id="register-title">Crea tu cuenta</h2>
        <p>
          Únete para guardar tus favoritos y recibir recomendaciones
          personalizadas.
        </p>
      </header>
      {errorMessage && <p className="auth-card__error">{errorMessage}</p>}
      <form className="auth-card__form" action="/register" method="post">
        <label className="auth-card__label" htmlFor="register-name">
          Nombre completo
        </label>
        <div className="auth-card__input-wrapper">
          <span className="auth-card__input-icon" aria-hidden="true">🙋‍♀️</span>
          <input
            id="register-name"
            className="auth-card__input"
            name="RegisterName"
            type="text"
            placeholder="Tu nombre"
            required
            autoComplete="name"
          />
        </div>

        <label className="auth-card__label" htmlFor="register-email">
          Correo electrónico
        </label>
        <div className="auth-card__input-wrapper">
          <span className="auth-card__input-icon" aria-hidden="true">📧</span>
          <input
            id="register-email"
            className="auth-card__input"
            name="RegisterEmail"
            type="email"
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />
        </div>

        <label className="auth-card__label" htmlFor="register-password">
          Contraseña
        </label>
        <div className="auth-card__input-wrapper">
          <span className="auth-card__input-icon" aria-hidden="true">🔐</span>
          <input
            id="register-password"
            className="auth-card__input"
            name="RegisterPassword"
            type="password"
            placeholder="Crea una contraseña segura"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <button type="submit" className="auth-card__button">
          Crear cuenta
        </button>
        <p className="auth-card__support-text">
          ¿Ya tienes una cuenta?{" "}
          <a className="auth-card__link" href="/login">
            Inicia sesión
          </a>
        </p>
      </form>
    </section>
  );
};
export default RegisterForm;
