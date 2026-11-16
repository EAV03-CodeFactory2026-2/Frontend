import { useEffect, useState } from "react";
import { Trash2, Plus, Boxes, CheckCircle2 } from "lucide-react";

import {
  api,
  type Negocio,
  type Recurso,
  type RecursoRequerido,
  type Servicio,
} from "../services/api";

import { obtenerSesion } from "../services/auth";

export default function RecursosServicio() {
  const token = obtenerSesion()?.token ?? "";

  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [negocioId, setNegocioId] = useState("");

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState("");

  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [asociados, setAsociados] = useState<RecursoRequerido[]>([]);

  const [recursoId, setRecursoId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);

  // Cargar negocios del propietario
  useEffect(() => {
    void api
      .negocios(token)
      .then(setNegocios)
      .catch((e) => setError(e.message));
  }, [token]);

  // Cargar servicios y recursos del negocio
  useEffect(() => {
    setServicioId("");
    setServicios([]);
    setRecursos([]);
    setAsociados([]);
    setRecursoId("");

    if (!negocioId) return;

    void Promise.all([
      api.serviciosPorNegocio(Number(negocioId), token),
      api.recursosPorNegocio(Number(negocioId), token),
    ])
      .then(([s, r]) => {
        setServicios(s);
        setRecursos(r.recursos);
      })
      .catch((e) => {
        setError(
          e instanceof Error
            ? e.message
            : "No fue posible cargar la información.",
        );
      });
  }, [negocioId, token]);

  // Recargar recursos asociados
  async function recargar() {
    if (!servicioId) return;

    const resultado = await api.recursosDeServicio(Number(servicioId), token);

    setAsociados(resultado);
  }

  useEffect(() => {
    setAsociados([]);
    setRecursoId("");
    setMensaje("");
    setError("");

    if (servicioId) {
      void recargar().catch((e) => {
        setError(
          e instanceof Error
            ? e.message
            : "No fue posible consultar los recursos.",
        );
      });
    }
  }, [servicioId, token]);

  // Asociar recurso a servicio
  async function asociar(e: React.FormEvent) {
    e.preventDefault();

    if (!servicioId || !recursoId || ocupado) return;

    setError("");
    setMensaje("");
    setOcupado(true);

    try {
      await api.asociarRecurso(
        Number(servicioId),
        Number(recursoId),
        cantidad,
        token,
      );

      setMensaje("Recurso asociado al servicio correctamente.");
      setRecursoId("");
      setCantidad(1);

      await recargar();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible asociar el recurso.",
      );
    } finally {
      setOcupado(false);
    }
  }

  // Quitar recurso de servicio
  async function quitar(id: number) {
    if (ocupado) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que deseas quitar este recurso del servicio?",
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");
    setOcupado(true);

    try {
      await api.quitarRecurso(Number(servicioId), id, token);

      setMensaje("Recurso quitado del servicio correctamente.");

      await recargar();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible quitar el recurso.",
      );
    } finally {
      setOcupado(false);
    }
  }

  // Recursos que todavía no están asociados
  const disponibles = recursos.filter(
    (r) =>
      r.idRecurso != null &&
      !asociados.some((a) => a.idRecurso === r.idRecurso),
  );

  const seleccionado = disponibles.find(
    (r) => String(r.idRecurso) === recursoId,
  );

  return (
    <main className="fondo-app min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ENCABEZADO */}
        <header className="mb-7">
          <h1 className="titulo-app text-3xl font-bold">
            Recursos requeridos por servicio
          </h1>

          <p className="texto-secundario mt-3">
            Administra los recursos necesarios para cada servicio y controla la
            capacidad de atención de tu negocio.
          </p>
        </header>

        {/* SELECCIÓN DE NEGOCIO Y SERVICIO */}
        <section className="superficie-app grid gap-5 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Seleccionar servicio</h2>

          <label className="block">
            <span className="mb-2 block font-medium">Negocio</span>

            <select
              className="campo-app w-full"
              value={negocioId}
              onChange={(e) => {
                setNegocioId(e.target.value);
                setError("");
                setMensaje("");
              }}
            >
              <option value="">Selecciona un negocio</option>

              {negocios.map((n) => (
                <option key={n.idNegocio} value={n.idNegocio}>
                  {n.nombreNegocio}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-medium">Servicio</span>

            <select
              className="campo-app w-full"
              value={servicioId}
              disabled={!negocioId}
              onChange={(e) => {
                setServicioId(e.target.value);
                setError("");
                setMensaje("");
              }}
            >
              <option value="">Selecciona un servicio</option>

              {servicios.map((s) => (
                <option key={s.idServicio} value={s.idServicio}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* MENSAJES */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500"
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-500"
          >
            <CheckCircle2 size={20} />
            {mensaje}
          </div>
        )}

        {servicioId && (
          <>
            {/* RECURSOS ASOCIADOS */}
            <section className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="titulo-app flex items-center gap-2 text-xl font-bold">
                  <Boxes size={23} />
                  Recursos asociados
                </h2>

                <span className="superficie-app rounded-full px-4 py-1 text-sm font-semibold">
                  {asociados.length} recursos
                </span>
              </div>

              {asociados.length === 0 ? (
                <div className="superficie-app rounded-2xl p-6 text-center">
                  <Boxes size={32} className="titulo-app mx-auto mb-3" />

                  <p className="texto-secundario">
                    Este servicio no tiene recursos asociados.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {asociados.map((r) => (
                    <article
                      key={r.idRecurso}
                      className="superficie-app flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background:
                              "color-mix(in srgb, var(--principal) 12%, transparent)",
                            color: "var(--principal)",
                          }}
                        >
                          <Boxes size={23} />
                        </div>

                        <div>
                          <h3 className="font-semibold">{r.nombreRecurso}</h3>

                          <p className="texto-secundario mt-1 text-sm">
                            {r.cantidadRequerida}{" "}
                            {r.cantidadRequerida === 1
                              ? "unidad requerida"
                              : "unidades requeridas"}
                          </p>
                        </div>
                      </div>

                      {/* BOTÓN ROJO REAL */}
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => void quitar(r.idRecurso)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          backgroundColor: "#b91c1c",
                          color: "#ffffff",
                          border: "1px solid #dc2626",
                          borderRadius: "10px",
                          padding: "11px 18px",
                          cursor: ocupado ? "not-allowed" : "pointer",
                          textDecoration: "none",
                        }}
                      >
                        <Trash2 size={17} />
                        Quitar recurso
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ASOCIAR NUEVO RECURSO */}
            <section className="superficie-app mt-8 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Plus size={22} className="titulo-app" />
                  Asociar nuevo recurso
                </h2>

                <p className="texto-secundario mt-2 text-sm">
                  Selecciona un recurso del mismo negocio e indica cuántas
                  unidades requiere este servicio.
                </p>
              </div>

              <form onSubmit={(e) => void asociar(e)} className="grid gap-5">
                <label className="block">
                  <span className="mb-2 block font-medium">
                    Recurso disponible
                  </span>

                  <select
                    required
                    className="campo-app w-full"
                    value={recursoId}
                    onChange={(e) => {
                      setRecursoId(e.target.value);
                      setCantidad(1);
                    }}
                  >
                    <option value="">Selecciona un recurso</option>

                    {disponibles.map((r) => (
                      <option key={r.idRecurso} value={r.idRecurso}>
                        {r.nombre} ({r.cantidad} unidades)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block font-medium">
                    Unidades requeridas
                  </span>

                  <input
                    className="campo-app w-full"
                    type="number"
                    min={1}
                    max={seleccionado?.cantidad}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    required
                  />

                  {seleccionado && (
                    <p className="texto-secundario mt-2 text-sm">
                      Disponibles en el negocio:{" "}
                      <strong>{seleccionado.cantidad} unidades</strong>
                    </p>
                  )}
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      ocupado ||
                      !recursoId ||
                      cantidad < 1 ||
                      (seleccionado != null && cantidad > seleccionado.cantidad)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: "#047857",
                      color: "#ffffff",
                      border: "1px solid #059669",
                    }}
                  >
                    <Plus size={19} />

                    {ocupado ? "Guardando..." : "Asociar recurso"}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
