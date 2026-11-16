import { useEffect, useState } from "react";
import {
  api,
  type FranjaDefinida,
  type Negocio,
  type Servicio,
  type ServicioAsignado,
  type ProveedorAsignado,
} from "../services/api";
import { obtenerSesion } from "../services/auth";
const dias = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];
type Item = { id: number; nombre: string; negocio: string };
export default function FranjasServicio() {
  const sesion = obtenerSesion();
  const token = sesion?.token ?? "";
  const propietario = sesion?.rol === "Propietario";
  const [servicios, setServicios] = useState<Item[]>([]);
  const [servicioId, setServicioId] = useState("");
  const [proveedores, setProveedores] = useState<ProveedorAsignado[]>([]);
  const [proveedorId, setProveedorId] = useState("");
  const [dia, setDia] = useState("LUNES");
  const [hora, setHora] = useState("09:00");
  const [franjas, setFranjas] = useState<FranjaDefinida[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    async function cargar() {
      try {
        if (propietario) {
          const negocios: Negocio[] = await api.negocios(token);
          const listas = await Promise.allSettled(
            negocios
              .filter((n) => n.idNegocio != null)
              .map(async (n) => {
                const ss: Servicio[] = await api.serviciosPorNegocio(
                  n.idNegocio!,
                  token,
                );
                return ss
                  .filter((s) => s.idServicio != null)
                  .map((s) => ({
                    id: s.idServicio!,
                    nombre: s.nombre,
                    negocio: n.nombreNegocio,
                  }));
              }),
          );
          setServicios(
            listas.flatMap((l) => (l.status === "fulfilled" ? l.value : [])),
          );
        } else {
          const ss: ServicioAsignado[] = await api.misServiciosAsignados(token);
          setServicios(
            ss.map((s) => ({
              id: s.idServicio,
              nombre: s.nombre,
              negocio: s.nombreNegocio ?? "",
            })),
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando servicios");
      }
    }
    void cargar();
  }, [token, propietario]);
  useEffect(() => {
    setProveedorId("");
    setProveedores([]);
    if (!servicioId) return;
    async function cargar() {
      try {
        const id = Number(servicioId);
        const f = await api.consultarFranjas(id, token);
        setFranjas(f);
        if (propietario)
          setProveedores(await api.proveedoresAsignados(id, token));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando franjas");
      }
    }
    void cargar();
  }, [servicioId, token, propietario]);
  async function recargar() {
    if (servicioId)
      setFranjas(await api.consultarFranjas(Number(servicioId), token));
  }
  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    const idProv = propietario ? Number(proveedorId) : undefined;
    if (propietario && !idProv) {
      setError("Selecciona un proveedor asignado.");
      return;
    }
    setOcupado(true);
    try {
      await api.crearFranja(
        {
          servicioId: Number(servicioId),
          proveedorId: idProv,
          diaSemana: dia,
          horaInicio: hora,
        },
        token,
      );
      setMensaje("Franja creada correctamente.");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creando franja");
    } finally {
      setOcupado(false);
    }
  }
  async function eliminar(f: FranjaDefinida) {
    if (!window.confirm(`¿Eliminar franja de ${f.diaSemana} ${f.horaInicio}?`))
      return;
    setError("");
    try {
      await api.eliminarFranja(Number(servicioId), f.idFranja, token);
      setMensaje("Franja eliminada.");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando franja");
    }
  }
  return (
    <main className="fondo-app min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="titulo-app text-3xl font-bold">
          Franjas horarias de servicios
        </h1>
        <p className="texto-secundario my-3">
          Organiza los días y las horas en que cada proveedor ofrece un
          servicio. Las franjas se repiten cada semana y solo pueden estar
          dentro del horario laboral.
        </p>
        <section className="superficie-app my-5 rounded-xl p-5">
          <label className="block font-semibold">
            Paso 1 · Elige el servicio{" "}
            <select
              className="campo-app mt-2 rounded-xl p-2"
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.nombre} · {s.negocio}
                </option>
              ))}
            </select>
          </label>
          <p className="texto-secundario mt-2 text-sm">
            Se mostrarán las franjas semanales definidas para este servicio.
          </p>
        </section>
        {error && (
          <p role="alert" className="my-3 text-red-600">
            {error}
          </p>
        )}
        {mensaje && (
          <p role="status" className="my-3 text-emerald-700">
            {mensaje}
          </p>
        )}
        {!servicioId && (
          <div className="superficie-app rounded-xl p-6 text-center texto-secundario">
            Selecciona primero un servicio para crear o consultar sus franjas
            horarias.
          </div>
        )}
        {servicioId && (
          <>
            <form
              onSubmit={(e) => void crear(e)}
              className="superficie-app grid gap-4 rounded-xl p-5 sm:grid-cols-2"
            >
              <h2 className="text-xl font-semibold sm:col-span-2">
                Paso 2 · Definir una nueva franja
              </h2>
              {propietario && (
                <label>
                  Proveedor asignado
                  <select
                    required
                    className="campo-app mt-2 w-full rounded-xl p-2"
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                  >
                    <option value="">Selecciona proveedor</option>
                    {proveedores.map((p) => (
                      <option key={p.idUsuario} value={p.idUsuario}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Día
                <select
                  className="campo-app mt-2 w-full rounded-xl p-2"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                >
                  {dias.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                Hora de inicio
                <input
                  type="time"
                  required
                  className="campo-app mt-2 w-full rounded-xl p-2"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </label>
              <p className="texto-secundario text-sm sm:col-span-2">
                La hora de finalización se calcula automáticamente según la
                duración del servicio. El proveedor debe estar asignado y tener
                horario laboral ese día.
              </p>
              <button
                type="submit"
                disabled={ocupado}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {ocupado ? "Guardando franja…" : "Crear franja"}
              </button>
            </form>
            <h2 className="titulo-app mt-8 mb-3 text-xl font-semibold">
              Paso 3 · Franjas definidas ({franjas.length})
            </h2>
            {franjas.length === 0 ? (
              <p>Este servicio aún no tiene franjas definidas.</p>
            ) : (
              [...franjas]
                .sort(
                  (a, b) =>
                    dias.indexOf(a.diaSemana) - dias.indexOf(b.diaSemana) ||
                    a.horaInicio.localeCompare(b.horaInicio) ||
                    a.nombreProveedor.localeCompare(b.nombreProveedor),
                )
                .map((f) => (
                  <article
                    key={f.idFranja}
                    className="superficie-app mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
                  >
                    <div>
                      <strong>
                        {f.diaSemana} · {f.horaInicio}–{f.horaFin}
                      </strong>
                      <p>{f.nombreProveedor}</p>
                      <p className="texto-secundario text-xs">
                        Creada por {f.nombreCreadaPor || "No indicado"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void eliminar(f)}
                      className="rounded-xl border border-red-400 px-4 py-2 font-semibold text-red-500 transition hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  </article>
                ))
            )}
          </>
        )}
      </div>
    </main>
  );
}
