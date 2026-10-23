import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { LockKeyhole, Eye, EyeOff, LogIn } from "lucide-react";

import {
  authApi,
  guardarSesion,
  rutaPorRol,
  ApiError,
  type Rol,
} from "../services/auth";

const rolesValidos: Rol[] = ["Cliente", "Propietario", "Proveedor"];

function esRol(valor: unknown): valor is Rol {
  return rolesValidos.some((rol) => rol === valor);
}

export default function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  const [roles, setRoles] = useState<Rol[]>([]);
  const [rol, setRol] = useState<Rol | "">("");

  const [cargando, setCargando] = useState(false);

  function limpiarRoles() {
    setRoles([]);
    setRol("");
    setError("");
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (cargando) return;

    setError("");

    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio || !contrasena) {
      setError("Debes ingresar tu correo electrónico y contraseña.");
      return;
    }

    if (roles.length > 0 && !rol) {
      setError("Selecciona el rol con el que deseas ingresar.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await authApi.login(
        correoLimpio,
        contrasena,
        rol || undefined,
      );

      // Verificar que WebAuth devolvió un token.
      if (typeof respuesta.token !== "string" || !respuesta.token.trim()) {
        throw new Error(
          "WebAuth no devolvió un token de autenticación válido.",
        );
      }

      // Verificar que el rol activo sea reconocido.
      if (!esRol(respuesta.rolActivo)) {
        throw new Error("WebAuth devolvió un rol activo no reconocido.");
      }

      // Comprobar coherencia con el rol seleccionado.
      if (rol && respuesta.rolActivo !== rol) {
        throw new Error(
          "El rol autenticado no coincide con el rol seleccionado.",
        );
      }

      // Guardar la sesión solo después de validar
      // los datos básicos de la respuesta.
      guardarSesion(respuesta.token, respuesta.rolActivo);

      // Ir al panel del rol autenticado.
      navigate(rutaPorRol(respuesta.rolActivo), { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.rolesDisponibles.length > 0) {
        const disponibles = err.rolesDisponibles.filter(esRol);

        setRoles(disponibles);
        setRol("");

        setError(
          "Tu cuenta tiene varios roles. " +
            "Selecciona con cuál deseas ingresar.",
        );
      } else if (err instanceof ApiError && err.status === 401) {
        setError(
          "Correo o contraseña incorrectos, " +
            "o no fue posible autenticar el rol seleccionado.",
        );
      } else if (err instanceof ApiError && err.status === 0) {
        setError(
          "No fue posible conectar con WebAuth. " +
            "Verifica que la API esté disponible " +
            "y que permita conexiones desde el frontend (CORS).",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo iniciar sesión. Inténtalo nuevamente.",
        );
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="fondo-app flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* ENCABEZADO */}
        <header className="mb-8 text-center">
          <div className="superficie-app mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm">
            <LockKeyhole size={38} className="titulo-app" aria-hidden="true" />
          </div>

          <h1 className="titulo-app text-3xl font-bold md:text-4xl">
            Bienvenido a ReservaFlow
          </h1>

          <p className="texto-secundario mt-3 text-base">
            Ingresa a tu cuenta para gestionar tus negocios, servicios y
            reservas.
          </p>
        </header>

        {/* FORMULARIO */}
        <form
          onSubmit={enviar}
          className="superficie-app rounded-2xl p-6 shadow-lg md:p-9"
        >
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Iniciar sesión
          </h2>

          {/* CORREO */}
          <div className="mb-6">
            <label htmlFor="login-correo" className="mb-2 block font-medium">
              Correo electrónico *
            </label>

            <input
              id="login-correo"
              className="campo-app"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              required
              disabled={cargando}
              onChange={(e) => {
                setCorreo(e.target.value);
                limpiarRoles();
              }}
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="mb-6">
            <label
              htmlFor="login-contrasena"
              className="mb-2 block font-medium"
            >
              Contraseña *
            </label>

            <div className="relative">
              <input
                id="login-contrasena"
                className="campo-app pr-14"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                required
                disabled={cargando}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  limpiarRoles();
                }}
              />

              <button
                type="button"
                aria-label={
                  visible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={visible}
                title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="texto-secundario absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-2 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>

          {/* SELECCIÓN DE ROL */}
          {roles.length > 0 && (
            <div className="mb-6">
              <label htmlFor="login-rol" className="mb-2 block font-medium">
                ¿Con qué rol deseas ingresar? *
              </label>

              <select
                id="login-rol"
                className="campo-app"
                value={rol}
                required
                disabled={cargando}
                onChange={(e) => {
                  const seleccionado = e.target.value;

                  if (seleccionado === "" || esRol(seleccionado)) {
                    setRol(seleccionado);
                    setError("");
                  }
                }}
              >
                <option value="">Selecciona tu rol</option>

                {roles.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>

              <p className="texto-secundario mt-2 text-sm">
                Accederás a las funcionalidades correspondientes al rol
                seleccionado.
              </p>
            </div>
          )}

          {/* MENSAJES DE ERROR */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {/* BOTÓN PRINCIPAL */}
          <button
            type="submit"
            disabled={cargando}
            className="boton-app flex w-full items-center justify-center gap-3 py-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={20} aria-hidden="true" />

            <span>
              {cargando ? "Verificando credenciales..." : "Iniciar sesión"}
            </span>
          </button>

          {/* ENLACE A REGISTRO */}
          <p className="mt-7 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/registro"
              className="titulo-app font-semibold underline underline-offset-4"
            >
              Regístrate
            </Link>
          </p>
        </form>

        {/* PIE DE PÁGINA */}
        <p className="texto-secundario mt-6 text-center text-xs">
          ReservaFlow · Plataforma de gestión de reservas
        </p>
      </div>
    </section>
  );
}
