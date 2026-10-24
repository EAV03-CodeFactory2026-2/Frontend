import { useEffect, useState, type FormEvent } from "react";

import {
  UserRound,
  ShieldCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  api,
  type PerfilUsuario,
  type AgregarRolPayload,
} from "../services/api";

import { obtenerSesion, type Rol } from "../services/auth";

const ROLES: Rol[] = ["Cliente", "Propietario", "Proveedor"];

const EVENTO_ROLES_ACTUALIZADOS = "reservaflow-roles-actualizados";

function normalizarRol(valor: string): Rol | null {
  return ROLES.find((rol) => rol.toLowerCase() === valor.toLowerCase()) ?? null;
}

export default function MiCuenta() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nuevoRol, setNuevoRol] = useState<Rol | "">("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [descripcionProfesional, setDescripcionProfesional] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Consultar el perfil real desde Masters.
  async function cargarPerfil() {
    const sesion = obtenerSesion();

    if (!sesion || sesion.token === "token-demo") {
      setPerfil(null);
      setError(
        "Para consultar tu cuenta necesitas iniciar sesión con WebAuth.",
      );
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await api.miPerfil(sesion.token);
      setPerfil(respuesta);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible consultar tu perfil.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarPerfil();
  }, []);

  // Roles registrados actualmente en Masters.
  const rolesAsignados = (perfil?.roles ?? [])
    .map(normalizarRol)
    .filter((rol): rol is Rol => rol !== null);

  // Roles que todavía se pueden agregar.
  const rolesParaAgregar = ROLES.filter((rol) => !rolesAsignados.includes(rol));

  // Agregar un rol adicional a la cuenta existente.
  async function agregarRol(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const sesion = obtenerSesion();

    if (!sesion || sesion.token === "token-demo") {
      setError("Debes iniciar sesión con una cuenta real.");
      return;
    }

    if (!perfil || !nuevoRol) {
      setError("Selecciona el rol que deseas agregar.");
      return;
    }

    if (rolesAsignados.includes(nuevoRol)) {
      setError("Ya tienes asignado ese rol.");
      return;
    }

    if (
      (nuevoRol === "Propietario" || nuevoRol === "Proveedor") &&
      (!tipoDocumento.trim() || !numeroDocumento.trim())
    ) {
      setError("Completa el tipo y número de documento.");
      return;
    }

    if (nuevoRol === "Proveedor" && !especialidad.trim()) {
      setError("Completa la especialidad del proveedor.");
      return;
    }

    const payload: AgregarRolPayload = {
      nombreRol: nuevoRol,
    };

    if (nuevoRol === "Propietario" || nuevoRol === "Proveedor") {
      payload.tipoDocumento = tipoDocumento.trim();
      payload.numeroDocumento = numeroDocumento.trim();
    }

    if (nuevoRol === "Proveedor") {
      payload.especialidad = especialidad.trim();
      payload.descripcionProfesional = descripcionProfesional.trim();
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      // 1. Solicitar a Masters la asignación del nuevo rol.
      await api.agregarRol(perfil.idUsuario, payload, sesion.token);

      const rolAgregado = nuevoRol;

      setMensaje(
        `El rol ${rolAgregado} fue agregado correctamente a tu cuenta.`,
      );

      // 2. Limpiar los campos del formulario.
      setNuevoRol("");
      setTipoDocumento("");
      setNumeroDocumento("");
      setEspecialidad("");
      setDescripcionProfesional("");

      // 3. Avisar que Masters confirmó la asignación.
      // El Sidebar podrá consultar nuevamente los roles en WebAuth.
      window.dispatchEvent(new Event(EVENTO_ROLES_ACTUALIZADOS));

      // 4. Actualizar la información del perfil desde Masters.
      try {
        const perfilActualizado = await api.miPerfil(sesion.token);

        setPerfil(perfilActualizado);
      } catch {
        setMensaje(
          `Masters confirmó que se agregó el rol ${rolAgregado}, ` +
            "pero no pudimos actualizar el perfil. " +
            "Presiona Actualizar perfil.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No fue posible agregar el rol.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="fondo-app min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* ENCABEZADO */}
        <header className="mb-8 text-center">
          <div className="superficie-app mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm">
            <UserRound size={38} className="titulo-app" aria-hidden="true" />
          </div>

          <h1 className="titulo-app text-3xl font-bold md:text-4xl">
            Mi cuenta
          </h1>

          <p className="texto-secundario mt-3">
            Consulta tu información personal y administra los roles asociados a
            tu cuenta.
          </p>
        </header>

        {/* MENSAJES DE ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* MENSAJES DE CONFIRMACIÓN */}
        {mensaje && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}

        {cargando ? (
          <div className="superficie-app rounded-2xl p-8 text-center shadow-sm">
            <p className="texto-secundario">
              Consultando información de tu cuenta...
            </p>
          </div>
        ) : (
          perfil && (
            <div className="space-y-6">
              {/* INFORMACIÓN PERSONAL */}
              <article className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <UserRound size={22} />
                    Información personal
                  </h2>

                  <button
                    type="button"
                    onClick={() => void cargarPerfil()}
                    disabled={guardando}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <RefreshCw size={17} />
                    Actualizar perfil
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="texto-secundario text-sm">Nombre</p>

                    <p className="mt-1 font-medium">
                      {perfil.nombre} {perfil.apellido}
                    </p>
                  </div>

                  <div>
                    <p className="texto-secundario text-sm">
                      Correo electrónico
                    </p>

                    <p className="mt-1 break-all font-medium">
                      {perfil.correo}
                    </p>
                  </div>
                </div>
              </article>

              {/* ROLES ACTUALES */}
              <article className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                  <ShieldCheck size={22} />
                  Mis roles
                </h2>

                <p className="texto-secundario mb-5 text-sm">
                  Estos son los roles registrados en Masters para tu cuenta.
                </p>

                <div className="flex flex-wrap gap-3">
                  {rolesAsignados.map((rol) => (
                    <span
                      key={rol}
                      className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                    >
                      <CheckCircle2 size={17} />
                      {rol}
                    </span>
                  ))}

                  {rolesAsignados.length === 0 && (
                    <p className="texto-secundario text-sm">
                      No se encontraron roles en el perfil.
                    </p>
                  )}
                </div>
              </article>

              {/* AGREGAR UN NUEVO ROL */}
              <article className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                  <Plus size={22} />
                  Agregar otro rol
                </h2>

                <p className="texto-secundario mb-6 text-sm">
                  Puedes agregar otro rol a tu misma cuenta sin registrarte
                  nuevamente.
                </p>

                {rolesParaAgregar.length === 0 ? (
                  <p className="texto-secundario">
                    Ya tienes asignados todos los roles disponibles.
                  </p>
                ) : (
                  <form onSubmit={agregarRol} className="space-y-5">
                    {/* SELECCIÓN DEL NUEVO ROL */}
                    <div>
                      <label
                        htmlFor="nuevo-rol"
                        className="mb-2 block font-medium"
                      >
                        Selecciona el nuevo rol *
                      </label>

                      <select
                        id="nuevo-rol"
                        className="campo-app w-full"
                        value={nuevoRol}
                        required
                        disabled={guardando}
                        onChange={(e) => {
                          setNuevoRol(e.target.value as Rol | "");
                          setError("");
                        }}
                      >
                        <option value="">Selecciona un rol</option>

                        {rolesParaAgregar.map((rol) => (
                          <option key={rol} value={rol}>
                            {rol}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DOCUMENTO REQUERIDO PARA PROPIETARIO Y PROVEEDOR */}
                    {(nuevoRol === "Propietario" ||
                      nuevoRol === "Proveedor") && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="tipo-documento"
                            className="mb-2 block font-medium"
                          >
                            Tipo de documento *
                          </label>

                          <input
                            id="tipo-documento"
                            className="campo-app w-full"
                            value={tipoDocumento}
                            onChange={(e) => setTipoDocumento(e.target.value)}
                            placeholder="Ej. CC"
                            required
                            disabled={guardando}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="numero-documento"
                            className="mb-2 block font-medium"
                          >
                            Número de documento *
                          </label>

                          <input
                            id="numero-documento"
                            className="campo-app w-full"
                            value={numeroDocumento}
                            onChange={(e) => setNumeroDocumento(e.target.value)}
                            required
                            disabled={guardando}
                          />
                        </div>
                      </div>
                    )}

                    {/* INFORMACIÓN PROFESIONAL SOLO PARA PROVEEDOR */}
                    {nuevoRol === "Proveedor" && (
                      <div className="space-y-5">
                        <div>
                          <label
                            htmlFor="especialidad"
                            className="mb-2 block font-medium"
                          >
                            Especialidad *
                          </label>

                          <input
                            id="especialidad"
                            className="campo-app w-full"
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            placeholder="Ej. Peluquería"
                            required
                            disabled={guardando}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="descripcion-profesional"
                            className="mb-2 block font-medium"
                          >
                            Descripción profesional
                          </label>

                          <textarea
                            id="descripcion-profesional"
                            className="campo-app w-full"
                            rows={4}
                            value={descripcionProfesional}
                            onChange={(e) =>
                              setDescripcionProfesional(e.target.value)
                            }
                            placeholder="Describe tu experiencia"
                            disabled={guardando}
                          />
                        </div>
                      </div>
                    )}

                    {/* BOTÓN PARA AGREGAR EL ROL */}
                    <button
                      type="submit"
                      disabled={guardando || !nuevoRol}
                      className="boton-app flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus size={20} />

                      {guardando
                        ? "Agregando rol..."
                        : "Agregar rol a mi cuenta"}
                    </button>
                  </form>
                )}
              </article>
            </div>
          )
        )}
      </div>
    </section>
  );
}
