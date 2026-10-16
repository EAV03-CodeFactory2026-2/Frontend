import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserRoundPlus,
  Store,
  CalendarDays,
  BriefcaseBusiness,
} from "lucide-react";
import {
  authApi,
  guardarSesion,
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
const inicial: RegistroPayload = {
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
const claveValida = (s: string) =>
  s.length >= 8 &&
  s.length <= 64 &&
  /[a-z]/.test(s) &&
  /[A-Z]/.test(s) &&
  /\d/.test(s) &&
  /[^a-zA-Z\d]/.test(s);
export default function Registro() {
  const [datos, setDatos] = useState<RegistroPayload>(inicial),
    [confirmar, setConfirmar] = useState(""),
    [visible, setVisible] = useState(false),
    [visible2, setVisible2] = useState(false),
    [error, setError] = useState(""),
    [cargando, setCargando] = useState(false),
    [tipos, setTipos] = useState<TipoDocumento[]>([]),
    [errorTipos, setErrorTipos] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    authApi
      .tiposDocumento()
      .then(setTipos)
      .catch(() =>
        setErrorTipos(
          "No se pudo cargar el catálogo de documentos. Comprueba la conexión con Masters.",
        ),
      );
  }, []);
  const cambiar = (campo: keyof RegistroPayload, valor: string) => {
    setDatos((prev: any) => ({ ...prev, [campo]: valor }));
    setError("");
  };
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!/^\d{7,15}$/.test(datos.telefono))
      return setError("El teléfono debe tener entre 7 y 15 dígitos.");
    if (!claveValida(datos.contrasena))
      return setError(
        "La contraseña debe tener de 8 a 64 caracteres, mayúscula, minúscula, número y símbolo.",
      );
    if (datos.contrasena !== confirmar)
      return setError("Las contraseñas no coinciden.");
    if (
      datos.rol !== "Cliente" &&
      (!datos.tipoDocumento || !datos.numeroDocumento?.trim())
    )
      return setError("Selecciona el tipo de documento y escribe su número.");
    if (
      datos.rol === "Proveedor" &&
      ((datos.especialidad?.trim().length || 0) < 2 ||
        (datos.especialidad?.trim().length || 0) > 100)
    )
      return setError("La especialidad debe tener entre 2 y 100 caracteres.");
    if ((datos.descripcionProfesional?.length || 0) > 500)
      return setError(
        "La descripción profesional no puede superar 500 caracteres.",
      );
    const payload: RegistroPayload = {
      rol: datos.rol,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim(),
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
      const r = await authApi.registro(payload);
      guardarSesion(r.token, r.rolActivo);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar el registro.",
      );
    } finally {
      setCargando(false);
    }
  }
  const campo = (
    nombre: string,
    campo: keyof RegistroPayload,
    tipo = "text",
    placeholder = "",
  ) => (
    <label className="block">
      <span className="mb-2 block font-medium">{nombre} *</span>
      <input
        className="campo-app"
        required
        type={tipo}
        value={datos[campo] || ""}
        placeholder={placeholder}
        onChange={(e) => cambiar(campo, e.target.value)}
      />
    </label>
  );
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
                <label className="block">
                  <span className="mb-2 block font-medium">
                    Tipo de documento *
                  </span>
                  <select
                    className="campo-app"
                    required
                    value={datos.tipoDocumento}
                    onChange={(e) => cambiar("tipoDocumento", e.target.value)}
                  >
                    <option value="">Selecciona una opción</option>
                    {tipos.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {t.nombre || t.descripcion || t.codigo} ({t.codigo})
                      </option>
                    ))}
                  </select>
                  {errorTipos && (
                    <small
                      role="alert"
                      className="mt-1 block"
                      style={{ color: "#dc2626" }}
                    >
                      {errorTipos}
                    </small>
                  )}
                </label>
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
                    value={datos.descripcionProfesional || ""}
                    onChange={(e) =>
                      cambiar("descripcionProfesional", e.target.value)
                    }
                    placeholder="Describe tu experiencia y servicios"
                  />
                  <small className="texto-secundario">
                    {datos.descripcionProfesional?.length || 0}/500 caracteres
                  </small>
                </label>
              </>
            )}
          </div>
          <h2 className="mb-4 mt-9 text-xl font-semibold">
            Seguridad de la cuenta
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              [
                datos.contrasena,
                "Contraseña",
                visible,
                () => setVisible(!visible),
                (v: string) => cambiar("contrasena", v),
              ],
              [
                confirmar,
                "Confirmar contraseña",
                visible2,
                () => setVisible2(!visible2),
                setConfirmar,
              ],
            ].map(([valor, nombre, ver, toggle, change]) => (
              <label key={nombre as string} className="block">
                <span className="mb-2 block font-medium">
                  {nombre as string} *
                </span>
                <span className="relative block">
                  <input
                    className="campo-app pr-12"
                    required
                    type={ver ? "text" : "password"}
                    value={valor as string}
                    onChange={(e) =>
                      (change as (s: string) => void)(e.target.value)
                    }
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    aria-label={
                      ver ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={toggle as () => void}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    {ver ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </span>
              </label>
            ))}
          </div>
          <p className="texto-secundario mt-3 text-sm">
            Entre 8 y 64 caracteres; incluye mayúscula, minúscula, número y
            símbolo.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg p-3"
              style={{ color: "#b91c1c", background: "#fee2e2" }}
            >
              {error}
            </p>
          )}
          <button
            className="boton-app mt-7 w-full"
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
