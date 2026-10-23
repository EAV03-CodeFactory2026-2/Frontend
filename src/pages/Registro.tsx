import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserRoundPlus,
  Store,
  CalendarDays,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import {
  authApi,
  guardarSesion,
  rutaPorRol,
  ApiError,
  type Rol,
  type RegistroPayload,
  type TipoDocumento,
} from "../services/auth";

const roles = [
  {
    rol: "Cliente" as Rol,
    descripcion: "Quiero reservar servicios",
    Icono: CalendarDays,
  },
  {
    rol: "Propietario" as Rol,
    descripcion: "Quiero administrar negocios",
    Icono: Store,
  },
  {
    rol: "Proveedor" as Rol,
    descripcion: "Quiero ofrecer mis servicios",
    Icono: BriefcaseBusiness,
  },
];

const datosIniciales: RegistroPayload = {
  rol: "Cliente",
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  contrasena: "",
  tipoDocumento: "",
  numeroDocumento: "",
  especialidad: "",
  descripcionProfesional: "",
};

const rolesValidos: Rol[] = ["Cliente", "Propietario", "Proveedor"];

function esRol(valor: unknown): valor is Rol {
  return rolesValidos.includes(valor as Rol);
}

function claveValida(clave: string): boolean {
  return (
    clave.length >= 8 &&
    clave.length <= 64 &&
    /[a-z]/.test(clave) &&
    /[A-Z]/.test(clave) &&
    /\d/.test(clave) &&
    /[^a-zA-Z\d]/.test(clave)
  );
}

export default function Registro() {
  const navigate = useNavigate();

  const [datos, setDatos] = useState<RegistroPayload>(datosIniciales);

  const [confirmar, setConfirmar] = useState("");
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [errorTipos, setErrorTipos] = useState("");
  const [cargandoTipos, setCargandoTipos] = useState(false);

  // Cargar los tipos de documento desde Masters.
  async function cargarTiposDocumento() {
    setCargandoTipos(true);
    setErrorTipos("");

    try {
      const respuesta = await authApi.tiposDocumento();

      if (!Array.isArray(respuesta)) {
        throw new Error("Masters devolvió un catálogo de documentos inválido.");
      }

      setTipos(respuesta);
    } catch {
      setTipos([]);
      setErrorTipos(
        "No se pudieron cargar los tipos de documento. Verifica la conexión con Masters.",
      );
    } finally {
      setCargandoTipos(false);
    }
  }

  useEffect(() => {
    void cargarTiposDocumento();
  }, []);

  function cambiar(campo: keyof RegistroPayload, valor: string) {
    setDatos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setError("");
  }

  function validarFormulario(): string | null {
    if (!datos.nombre.trim() || !datos.apellido.trim()) {
      return "Ingresa tus nombres y apellidos.";
    }

    if (!datos.correo.trim()) {
      return "Ingresa tu correo electrónico.";
    }

    if (!/^\d{7,15}$/.test(datos.telefono.trim())) {
      return "El teléfono debe tener entre 7 y 15 dígitos.";
    }

    if (!claveValida(datos.contrasena)) {
      return (
        "La contraseña debe tener entre 8 y 64 caracteres, " +
        "con mayúscula, minúscula, número y símbolo."
      );
    }

    if (datos.contrasena !== confirmar) {
      return "Las contraseñas no coinciden.";
    }

    if (datos.rol !== "Cliente") {
      if (!datos.tipoDocumento || !datos.numeroDocumento?.trim()) {
        return "Selecciona el tipo de documento y escribe su número.";
      }

      if (!tipos.some((tipo) => tipo.codigo === datos.tipoDocumento)) {
        return "Selecciona un tipo de documento válido.";
      }
    }

    if (datos.rol === "Proveedor") {
      const longitud = datos.especialidad?.trim().length ?? 0;

      if (longitud < 2 || longitud > 100) {
        return "La especialidad debe tener entre 2 y 100 caracteres.";
      }

      if ((datos.descripcionProfesional?.length ?? 0) > 500) {
        return "La descripción profesional no puede superar 500 caracteres.";
      }
    }

    return null;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (cargando) return;

    setError("");

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    const payload: RegistroPayload = {
      rol: datos.rol,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim().toLowerCase(),
      telefono: datos.telefono.trim(),
      contrasena: datos.contrasena,
    };

    if (datos.rol !== "Cliente") {
      payload.tipoDocumento = datos.tipoDocumento;
      payload.numeroDocumento = datos.numeroDocumento?.trim();
    }

    if (datos.rol === "Proveedor") {
      payload.especialidad = datos.especialidad?.trim();
      payload.descripcionProfesional = datos.descripcionProfesional?.trim();
    }

    setCargando(true);

    try {
      const respuesta = await authApi.registro(payload);

      if (!respuesta.token || !esRol(respuesta.rolActivo)) {
        throw new Error(
          "El registro respondió, pero no devolvió una sesión válida.",
        );
      }

      guardarSesion(respuesta.token, respuesta.rolActivo);

      navigate(rutaPorRol(respuesta.rolActivo), {
        replace: true,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "Este correo o documento ya está registrado. " +
            "Si ya tienes una cuenta, inicia sesión.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo completar el registro.",
        );
      }
    } finally {
      setCargando(false);
    }
  }

  function campo(
    nombre: string,
    propiedad: keyof RegistroPayload,
    tipo = "text",
    placeholder = "",
  ) {
    return (
      <label className="block">
        <span className="mb-2 block font-medium">{nombre} *</span>

        <input
          className="campo-app"
          required
          disabled={cargando}
          type={tipo}
          value={datos[propiedad] ?? ""}
          placeholder={placeholder}
          onChange={(e) => cambiar(propiedad, e.target.value)}
        />
      </label>
    );
  }

  return (
    <section className="fondo-app min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <UserRoundPlus className="titulo-app mx-auto mb-3" size={42} />

          <h1 className="titulo-app text-3xl font-bold">
            Crea tu cuenta en ReservaFlow
          </h1>

          <p className="texto-secundario mt-2">
            Selecciona cómo quieres utilizar la plataforma.
          </p>
        </header>

        <form
          onSubmit={enviar}
          className="superficie-app rounded-2xl p-5 shadow-lg md:p-9"
        >
          <h2 className="mb-4 text-xl font-semibold">
            ¿Cómo quieres registrarte?
          </h2>

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {roles.map(({ rol, descripcion, Icono }) => (
              <button
                key={rol}
                type="button"
                disabled={cargando}
                aria-pressed={datos.rol === rol}
                onClick={() => cambiar("rol", rol)}
                className="superficie-app rounded-xl p-4 text-center focus-visible:outline-2"
                style={{
                  borderColor:
                    datos.rol === rol ? "var(--principal)" : "var(--borde)",
                  borderWidth: datos.rol === rol ? 2 : 1,
                }}
              >
                <Icono className="titulo-app mx-auto mb-2" />

                <strong className="block">{rol}</strong>

                <small className="texto-secundario">{descripcion}</small>
              </button>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold">Información personal</h2>

          <div className="grid gap-5 md:grid-cols-2">
            {campo("Nombres", "nombre", "text", "Ej. Mariana")}

            {campo("Apellidos", "apellido", "text", "Ej. Gómez")}

            {campo(
              "Correo electrónico",
              "correo",
              "email",
              "correo@ejemplo.com",
            )}

            {campo("Teléfono", "telefono", "tel", "3001234567")}

            {datos.rol !== "Cliente" && (
              <>
                <div>
                  <label className="block">
                    <span className="mb-2 block font-medium">
                      Tipo de documento *
                    </span>

                    <select
                      className="campo-app"
                      required
                      disabled={cargando || cargandoTipos}
                      value={datos.tipoDocumento ?? ""}
                      onChange={(e) => cambiar("tipoDocumento", e.target.value)}
                    >
                      <option value="">Selecciona una opción</option>

                      {tipos.map((tipo) => (
                        <option key={tipo.codigo} value={tipo.codigo}>
                          {tipo.nombre || tipo.descripcion || tipo.codigo}
                          {" ("}
                          {tipo.codigo}
                          {")"}
                        </option>
                      ))}
                    </select>
                  </label>

                  {cargandoTipos && (
                    <p className="texto-secundario mt-2 text-sm">
                      Cargando documentos...
                    </p>
                  )}

                  {errorTipos && (
                    <div className="mt-2">
                      <p role="alert" className="text-sm text-red-600">
                        {errorTipos}
                      </p>

                      <button
                        type="button"
                        disabled={cargandoTipos || cargando}
                        onClick={() => void cargarTiposDocumento()}
                        className="titulo-app mt-2 flex items-center gap-2 text-sm underline"
                      >
                        <RefreshCw size={16} />
                        Reintentar
                      </button>
                    </div>
                  )}
                </div>

                {campo(
                  "Número de documento",
                  "numeroDocumento",
                  "text",
                  "Número de documento",
                )}
              </>
            )}

            {datos.rol === "Proveedor" && (
              <>
                <div className="md:col-span-2">
                  {campo(
                    "Especialidad",
                    "especialidad",
                    "text",
                    "Ej. Barbería, fisioterapia",
                  )}
                </div>

                <label className="block md:col-span-2">
                  <span className="mb-2 block font-medium">
                    Descripción profesional (opcional)
                  </span>

                  <textarea
                    className="campo-app"
                    maxLength={500}
                    rows={3}
                    disabled={cargando}
                    value={datos.descripcionProfesional ?? ""}
                    onChange={(e) =>
                      cambiar("descripcionProfesional", e.target.value)
                    }
                    placeholder="Describe tu experiencia y servicios"
                  />

                  <small className="texto-secundario">
                    {datos.descripcionProfesional?.length ?? 0}
                    /500 caracteres
                  </small>
                </label>
              </>
            )}
          </div>

          <h2 className="mb-4 mt-9 text-xl font-semibold">
            Seguridad de la cuenta
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-medium">Contraseña *</span>

              <span className="relative block">
                <input
                  className="campo-app pr-12"
                  required
                  disabled={cargando}
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  value={datos.contrasena}
                  onChange={(e) => cambiar("contrasena", e.target.value)}
                  placeholder="Ingresa tu contraseña"
                />

                <button
                  type="button"
                  aria-label={
                    visible ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  {visible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block font-medium">
                Confirmar contraseña *
              </span>

              <span className="relative block">
                <input
                  className="campo-app pr-12"
                  required
                  disabled={cargando}
                  type={visible2 ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmar}
                  onChange={(e) => {
                    setConfirmar(e.target.value);
                    setError("");
                  }}
                  placeholder="Repite tu contraseña"
                />

                <button
                  type="button"
                  aria-label={
                    visible2 ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setVisible2(!visible2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  {visible2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>
          </div>

          <p className="texto-secundario mt-3 text-sm">
            Entre 8 y 64 caracteres; incluye mayúscula, minúscula, número y
            símbolo.
          </p>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <button
            className="boton-app mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
            disabled={cargando}
            type="submit"
          >
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>

          <p className="mt-5 text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link className="titulo-app underline" to="/login">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
