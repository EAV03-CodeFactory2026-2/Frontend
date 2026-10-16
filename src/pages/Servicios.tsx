import { useEffect, useState, type FormEvent } from "react";
import {
  BriefcaseBusiness,
  Plus,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Store,
} from "lucide-react";

import {
  api,
  type Negocio,
  type Servicio,
  type Modalidad,
} from "../services/api";
import { obtenerSesion } from "../services/auth";
import { negociosDemo, modalidadesDemo } from "../mocks/demo";
import { obtenerServiciosDemo, guardarServicioDemo, obtenerAsignacionesDemo, proveedoresDemo } from "../mocks/asignacionesDemo";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";
console.log("¿Modo demostración activo?", MODO_DEMO);
console.log("Valor del archivo .env.local:", import.meta.env.VITE_MODO_DEMO);

export default function Servicios() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [asignaciones, setAsignaciones] = useState<Record<string, number[]>>({});
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);

  const [negocioId, setNegocioId] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modalidadId, setModalidadId] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");

  const [cargandoNegocios, setCargandoNegocios] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [cargandoModalidades, setCargandoModalidades] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [errorNegocios, setErrorNegocios] = useState("");
  const [errorServicios, setErrorServicios] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [mensaje, setMensaje] = useState("");

  const token = obtenerSesion()?.token ?? "";

  useEffect(() => {
    if (MODO_DEMO) setAsignaciones(obtenerAsignacionesDemo());
  }, []);

  // Consultar los negocios al ingresar a la pantalla.
  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargandoNegocios(true);

      if (MODO_DEMO) {
        if (activo) {
          setNegocios([...negociosDemo]);
          setErrorNegocios("");
          setCargandoNegocios(false);
        }
        return;
      }

      try {
        if (!token) {
          throw new Error("Debes iniciar sesión.");
        }

        const respuesta = await api.negocios(token);

        if (!Array.isArray(respuesta)) {
          throw new Error("Formato de negocios inesperado.");
        }

        if (activo) {
          setNegocios(respuesta);
        }
      } catch (e) {
        if (activo) {
          setErrorNegocios(
            e instanceof Error
              ? e.message
              : "No se pudieron cargar los negocios.",
          );
        }
      } finally {
        if (activo) {
          setCargandoNegocios(false);
        }
      }
    }

    void cargar();

    return () => {
      activo = false;
    };
  }, [token]);

  // Consultar servicios al seleccionar un negocio.
  useEffect(() => {
    let activo = true;

    setServicios([]);
    setErrorServicios("");

    if (!negocioId || !token) {
      setCargandoServicios(false);
      return;
    }

    async function cargar() {
      setCargandoServicios(true);

      if (MODO_DEMO) {
        if (activo) {
          setServicios(
            obtenerServiciosDemo().filter(
              (servicio) => servicio.negocioId === Number(negocioId),
            ),
          );
          setErrorServicios("");
          setCargandoServicios(false);
        }
        return;
      }

      try {
        const respuesta = await api.serviciosPorNegocio(
          Number(negocioId),
          token,
        );

        if (!Array.isArray(respuesta)) {
          throw new Error("Formato de servicios inesperado.");
        }

        if (activo) {
          setServicios(respuesta);
        }
      } catch (e) {
        if (activo) {
          setErrorServicios(
            e instanceof Error
              ? e.message
              : "No se pudieron cargar los servicios.",
          );
        }
      } finally {
        if (activo) {
          setCargandoServicios(false);
        }
      }
    }

    void cargar();

    return () => {
      activo = false;
    };
  }, [negocioId, token]);

  async function cargarModalidades() {
    setCargandoModalidades(true);
    setErrorFormulario("");

    if (MODO_DEMO) {
      setModalidades([...modalidadesDemo]);
      setErrorFormulario("");
      setCargandoModalidades(false);
      return;
    }

    try {
      const respuesta = await api.modalidades();

      if (!Array.isArray(respuesta)) {
        throw new Error("Formato de modalidades inesperado.");
      }

      setModalidades(respuesta);
    } catch (e) {
      setModalidades([]);
      setErrorFormulario(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar las modalidades.",
      );
    } finally {
      setCargandoModalidades(false);
    }
  }

  async function actualizarNegocios() {
    setCargandoNegocios(true);
    setErrorNegocios("");

    try {
      if (MODO_DEMO) {
        setNegocios([...negociosDemo]);
        return;
      }
      if (!token) {
        throw new Error("Debes iniciar sesión.");
      }

      const respuesta = await api.negocios(token);

      if (!Array.isArray(respuesta)) {
        throw new Error("Formato de negocios inesperado.");
      }

      setNegocios(respuesta);

      const sigueExistiendo = respuesta.some(
        (negocio) => String(negocio.idNegocio) === negocioId,
      );

      if (!sigueExistiendo) {
        setNegocioId("");
        setServicios([]);
      }
    } catch (e) {
      setErrorNegocios(
        e instanceof Error
          ? e.message
          : "No se pudieron actualizar los negocios.",
      );
    } finally {
      setCargandoNegocios(false);
    }
  }

  async function actualizarServicios() {
    if (!negocioId || !token) return;

    setCargandoServicios(true);
    setErrorServicios("");

    try {
      if (MODO_DEMO) {
        setServicios(obtenerServiciosDemo().filter((s) => s.negocioId === Number(negocioId)));
        setAsignaciones(obtenerAsignacionesDemo());
        return;
      }
      const respuesta = await api.serviciosPorNegocio(Number(negocioId), token);

      if (!Array.isArray(respuesta)) {
        throw new Error("Formato de servicios inesperado.");
      }

      setServicios(respuesta);
    } catch (e) {
      setErrorServicios(
        e instanceof Error
          ? e.message
          : "No se pudieron actualizar los servicios.",
      );
    } finally {
      setCargandoServicios(false);
    }
  }

  function abrirFormulario() {
    setMensaje("");
    setErrorFormulario("");
    setMostrarFormulario(true);
    void cargarModalidades();
  }

  function cerrarFormulario() {
    if (guardando) return;
    setMostrarFormulario(false);
    setErrorFormulario("");
  }

  function limpiarFormulario() {
    setNombre("");
    setDescripcion("");
    setModalidadId("");
    setDuracion("");
    setPrecio("");
  }

  async function guardarServicio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorFormulario("");
    setMensaje("");

    if (!token || !negocioId) {
      setErrorFormulario("Debes iniciar sesión y seleccionar un negocio.");
      return;
    }

    const idNegocio = Number(negocioId);
    const idModalidad = Number(modalidadId);
    const minutos = Number(duracion);
    const valor = Number(precio);

    if (
      !Number.isSafeInteger(idNegocio) ||
      idNegocio <= 0 ||
      !Number.isSafeInteger(idModalidad) ||
      idModalidad <= 0 ||
      !Number.isSafeInteger(minutos) ||
      minutos <= 0 ||
      !Number.isFinite(valor) ||
      valor < 0
    ) {
      setErrorFormulario(
        "Revisa el negocio, la modalidad, la duración y el precio.",
      );
      return;
    }

    if (
      !nombre.trim() ||
      !descripcion.trim() ||
      !modalidades.some((m) => m.idModalidad === idModalidad)
    ) {
      setErrorFormulario(
        "Completa los campos y selecciona una modalidad válida.",
      );
      return;
    }

    setGuardando(true);

    if (MODO_DEMO) {
      const nuevoServicio: Servicio = {
        idServicio: Date.now(),
        negocioId: idNegocio,
        modalidadId: idModalidad,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        duracionMinutos: minutos,
        precio: valor,
      };

      guardarServicioDemo(nuevoServicio);

      setServicios(
        obtenerServiciosDemo().filter((servicio) => servicio.negocioId === idNegocio),
      );

      limpiarFormulario();
      setMostrarFormulario(false);
      setErrorFormulario("");
      setMensaje(
        "Servicio registrado en modo demostración. No se envió a la API.",
      );
      setGuardando(false);
      return;
    }

    try {
      await api.crearServicio(
        {
          negocioId: idNegocio,
          modalidadId: idModalidad,
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          duracionMinutos: minutos,
          precio: valor,
        },
        token,
      );

      limpiarFormulario();
      setMostrarFormulario(false);
      setMensaje("Servicio registrado correctamente.");
      await actualizarServicios();
    } catch (e) {
      setErrorFormulario(
        e instanceof Error ? e.message : "No se pudo registrar el servicio.",
      );
    } finally {
      setGuardando(false);
    }
  }

  const negocioSeleccionado = negocios.find(
    (negocio) => String(negocio.idNegocio) === negocioId,
  );

  return (
    <section className="fondo-app min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* ENCABEZADO */}
        <header className="mb-8 text-center">
          <div className="superficie-app mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
            <BriefcaseBusiness size={30} className="titulo-app" />
          </div>

          <h1 className="titulo-app text-3xl font-bold">
            Gestión de Servicios
          </h1>

          <p className="texto-secundario mt-3">
            Administra los servicios que ofrecen tus negocios.
          </p>
        </header>

        {mensaje && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-green-600 p-4"
          >
            <CheckCircle2 size={22} className="text-green-600" />
            <span>{mensaje}</span>
          </div>
        )}

        {/* SELECCIÓN DEL NEGOCIO */}
        <div className="superficie-app mb-6 rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Store size={22} />
              Seleccionar negocio
            </h2>

            <button
              type="button"
              className="campo-app !w-auto flex items-center gap-2"
              onClick={() => void actualizarNegocios()}
              disabled={cargandoNegocios}
            >
              <RefreshCw size={17} />
              Actualizar negocios
            </button>
          </div>

          <label
            htmlFor="seleccionar-negocio"
            className="mb-2 block font-medium"
          >
            Negocio
          </label>

          <select
            id="seleccionar-negocio"
            className="campo-app"
            value={negocioId}
            disabled={cargandoNegocios || negocios.length === 0}
            onChange={(e) => {
              setNegocioId(e.target.value);
              setMostrarFormulario(false);
              setMensaje("");
            }}
          >
            <option value="">
              {cargandoNegocios
                ? "Cargando negocios..."
                : "Selecciona uno de tus negocios"}
            </option>

            {negocios
              .filter((negocio) => negocio.idNegocio != null)
              .map((negocio) => (
                <option
                  key={negocio.idNegocio}
                  value={String(negocio.idNegocio)}
                >
                  {negocio.nombreNegocio}
                </option>
              ))}
          </select>

          {errorNegocios && (
            <p role="alert" className="mt-3 flex gap-2 text-sm text-red-500">
              <AlertCircle size={18} className="shrink-0" />
              {errorNegocios}
            </p>
          )}
        </div>

        {/* LISTADO DE SERVICIOS */}
        <div className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Mis servicios</h2>

              <p className="texto-secundario mt-1 text-sm">
                {negocioSeleccionado
                  ? `Servicios de ${negocioSeleccionado.nombreNegocio}`
                  : "Selecciona un negocio para consultar sus servicios."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="campo-app !w-auto flex items-center gap-2"
                onClick={() => void actualizarServicios()}
                disabled={!negocioId || cargandoServicios}
              >
                <RefreshCw size={18} />
                Actualizar
              </button>

              <button
                type="button"
                className="boton-app flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={abrirFormulario}
                disabled={!negocioId}
              >
                <Plus size={19} />
                Nuevo servicio
              </button>
            </div>
          </div>

          {errorServicios && (
            <p role="alert" className="mb-5 flex gap-2 text-sm text-red-500">
              <AlertCircle size={18} className="shrink-0" />
              {errorServicios}
            </p>
          )}

          {!negocioId ? (
            <div className="rounded-xl border p-10 text-center">
              <Store size={40} className="titulo-app mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Selecciona un negocio</h3>
              <p className="texto-secundario mt-2">
                Aquí aparecerán los servicios del negocio seleccionado.
              </p>
            </div>
          ) : cargandoServicios ? (
            <p className="texto-secundario py-10 text-center">
              Cargando servicios...
            </p>
          ) : servicios.length === 0 ? (
            <div className="rounded-xl border p-10 text-center">
              <BriefcaseBusiness
                size={40}
                className="titulo-app mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">
                No hay servicios para mostrar
              </h3>
              <p className="texto-secundario mt-2">
                Puedes registrar el primer servicio de este negocio.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {servicios.map((servicio, indice) => {
                const modalidad = modalidades.find(
                  (m) => m.idModalidad === servicio.modalidadId,
                );

                const idsAsignados = servicio.idServicio != null
                  ? asignaciones[String(servicio.idServicio)] ?? []
                  : [];
                const nombresAsignados = idsAsignados.map((id) => {
                  const p = proveedoresDemo.find((proveedor) => proveedor.idProveedor === id);
                  return p ? `${p.nombre} ${p.apellido}` : `Proveedor #${id}`;
                });

                return (
                  <article
                    key={servicio.idServicio ?? indice}
                    className="superficie-app rounded-xl border p-5"
                  >
                    <h3 className="mb-2 text-lg font-semibold">
                      {servicio.nombre}
                    </h3>

                    <p className="texto-secundario mb-4 text-sm">
                      {servicio.descripcion}
                    </p>

                    <div className="texto-secundario space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <Clock3 size={17} />
                        {servicio.duracionMinutos} minutos
                      </p>

                      <p>
                        <strong>Precio:</strong>{" "}
                        {servicio.precio.toLocaleString("es-CO")}
                      </p>

                      <p>
                        <strong>Modalidad:</strong>{" "}
                        {modalidad?.nombreModalidad ??
                          `ID ${servicio.modalidadId}`}
                      </p>
                    </div>
                    {MODO_DEMO && (
                      <div className="mt-5 border-t pt-4">
                        {idsAsignados.length > 0 ? (
                          <>
                            <p className="flex items-center gap-2 font-semibold text-green-600">
                              <CheckCircle2 size={19} /> Asignado
                            </p>
                            <p className="texto-secundario mt-2 text-sm">
                              {idsAsignados.length} proveedor(es) asignado(s)
                            </p>
                            {nombresAsignados.map((nombre, i) => (
                              <p key={`${nombre}-${i}`} className="mt-1 text-sm">{nombre}</p>
                            ))}
                          </>
                        ) : (
                          <>
                            <p className="font-semibold">No asignado</p>
                            <p className="texto-secundario mt-2 text-sm">Sin proveedores vinculados.</p>
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* FORMULARIO DESPLEGABLE */}
        {mostrarFormulario && (
          <div className="superficie-app mt-8 rounded-2xl p-6 shadow-lg md:p-9">
            <div className="mb-7 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">
                Registrar nuevo servicio
              </h2>

              <button
                type="button"
                aria-label="Cerrar formulario"
                disabled={guardando}
                onClick={cerrarFormulario}
                className="rounded-lg p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarServicio} className="space-y-5">
              <div>
                <label
                  htmlFor="servicio-nombre"
                  className="mb-2 block font-medium"
                >
                  Nombre del servicio *
                </label>

                <input
                  id="servicio-nombre"
                  required
                  className="campo-app"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Corte de cabello"
                />
              </div>

              <div>
                <label
                  htmlFor="servicio-descripcion"
                  className="mb-2 block font-medium"
                >
                  Descripción *
                </label>

                <textarea
                  id="servicio-descripcion"
                  required
                  className="campo-app min-h-24"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el servicio"
                />
              </div>

              <div>
                <label
                  htmlFor="servicio-modalidad"
                  className="mb-2 block font-medium"
                >
                  Modalidad *
                </label>

                <select
                  id="servicio-modalidad"
                  required
                  className="campo-app"
                  value={modalidadId}
                  disabled={cargandoModalidades || modalidades.length === 0}
                  onChange={(e) => setModalidadId(e.target.value)}
                >
                  <option value="">
                    {cargandoModalidades
                      ? "Cargando modalidades..."
                      : "Selecciona una modalidad"}
                  </option>

                  {modalidades.map((modalidad) => (
                    <option
                      key={modalidad.idModalidad}
                      value={String(modalidad.idModalidad)}
                    >
                      {modalidad.nombreModalidad}
                    </option>
                  ))}
                </select>

                {errorFormulario && (
                  <div role="alert" className="mt-3 text-sm text-red-500">
                    <p>{errorFormulario}</p>

                    {modalidades.length === 0 && (
                      <button
                        type="button"
                        className="mt-2 underline"
                        onClick={() => void cargarModalidades()}
                      >
                        Reintentar cargar modalidades
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="servicio-duracion"
                    className="mb-2 block font-medium"
                  >
                    Duración (minutos) *
                  </label>

                  <input
                    id="servicio-duracion"
                    type="number"
                    min="1"
                    step="1"
                    required
                    className="campo-app"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    placeholder="Ej. 30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="servicio-precio"
                    className="mb-2 block font-medium"
                  >
                    Precio *
                  </label>

                  <input
                    id="servicio-precio"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="campo-app"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Ej. 25000"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-5">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  className="campo-app !w-auto"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    guardando || cargandoModalidades || modalidades.length === 0
                  }
                  className="boton-app disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar servicio"}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="texto-secundario mt-8 text-center text-sm">
          ReservaFlow · Plataforma de gestión de reservas
        </p>
      </div>
    </section>
  );
}
