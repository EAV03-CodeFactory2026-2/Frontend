import { useEffect, useState } from "react";
import { Users, Search, UserRoundPlus, CheckCircle2 } from "lucide-react";
import {
  api,
  type Negocio,
  type Servicio,
  type ProveedorDirectorio,
} from "../services/api";
import { obtenerSesion } from "../services/auth";
import { negociosDemo } from "../mocks/demo";
import {
  proveedoresDemo,
  obtenerServiciosDemo,
  obtenerAsignacionesDemo,
  guardarAsignacionDemo,
} from "../mocks/asignacionesDemo";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";

export default function AsignacionProveedores() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [negocioId, setNegocioId] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState("");
  const [criterio, setCriterio] = useState("");
  const [resultados, setResultados] = useState<ProveedorDirectorio[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [asignados, setAsignados] = useState<number[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const token = obtenerSesion()?.token ?? "";

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const datos = MODO_DEMO ? negociosDemo : await api.negocios(token);
        if (activo) setNegocios([...datos]);
      } catch (e) {
        if (activo)
          setError(
            e instanceof Error
              ? e.message
              : "No se pudieron cargar los negocios.",
          );
      }
    }
    void cargar();
    return () => {
      activo = false;
    };
  }, [token]);

  useEffect(() => {
    let activo = true;
    setServicioId("");
    setServicios([]);
    setSeleccionados([]);
    setAsignados([]);
    setResultados([]);
    setMensaje("");
    setError("");
    if (!negocioId) return;
    async function cargar() {
      try {
        const datos = MODO_DEMO
          ? obtenerServiciosDemo().filter(
              (s) => s.negocioId === Number(negocioId),
            )
          : await api.serviciosPorNegocio(Number(negocioId), token);
        if (activo) setServicios(datos);
      } catch (e) {
        if (activo)
          setError(
            e instanceof Error
              ? e.message
              : "No se pudieron cargar los servicios.",
          );
      }
    }
    void cargar();
    return () => {
      activo = false;
    };
  }, [negocioId, token]);

  useEffect(() => {
    setSeleccionados([]);
    setResultados([]);
    setCriterio("");
    setMensaje("");
    setError("");
    if (!servicioId) {
      setAsignados([]);
      return;
    }
    if (MODO_DEMO) {
      setAsignados(obtenerAsignacionesDemo()[servicioId] ?? []);
    } else {
      // En producción el listado de asignados debe obtenerse del detalle del servicio.
      setAsignados([]);
    }
  }, [servicioId]);

  async function buscar() {
    setError("");
    setMensaje("");
    setResultados([]);
    const texto = criterio.trim();
    if (texto.length < 3) {
      setError("Escribe al menos 3 caracteres para buscar.");
      return;
    }
    if (!servicioId) {
      setError("Primero selecciona un servicio.");
      return;
    }
    setCargando(true);
    try {
      if (MODO_DEMO) {
        const normalizar = (valor: string) =>
          valor
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("es")
            .trim();
        const encontrado = proveedoresDemo.filter((p) =>
          [
            p.nombre,
            p.apellido,
            p.especialidad,
            p.tipoDocumento,
            p.numeroDocumento,
            `${p.nombre} ${p.apellido}`,
          ].some((campo) => normalizar(campo).includes(normalizar(texto))),
        );
        setResultados(encontrado);
      } else {
        const datos = await api.buscarProveedores(texto, token);
        if (!Array.isArray(datos))
          throw new Error(
            "El directorio devolvió un formato paginado que aún debe adaptarse.",
          );
        setResultados(datos);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible buscar proveedores.",
      );
    } finally {
      setCargando(false);
    }
  }

  function alternarProveedor(id: number) {
    if (asignados.includes(id)) return;
    setSeleccionados((actual) =>
      actual.includes(id) ? actual.filter((v) => v !== id) : [...actual, id],
    );
  }

  async function asignar() {
    setError("");
    setMensaje("");
    if (!servicioId) {
      setError("Selecciona un servicio.");
      return;
    }
    const nuevos = seleccionados.filter((id) => !asignados.includes(id));
    if (nuevos.length === 0) {
      setError("Selecciona al menos un proveedor nuevo.");
      return;
    }
    setCargando(true);
    try {
      if (MODO_DEMO) {
        const actualizados = [...asignados, ...nuevos];
        guardarAsignacionDemo(Number(servicioId), actualizados);
        setAsignados(actualizados);
      } else {
        await api.asignarProveedores(Number(servicioId), nuevos, token);
        setAsignados((actual) => [...actual, ...nuevos]);
      }
      setSeleccionados([]);
      setMensaje(`Servicio asignado a ${nuevos.length} proveedor(es).`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo realizar la asignación.",
      );
    } finally {
      setCargando(false);
    }
  }

  const servicioSeleccionado = servicios.find(
    (s) => String(s.idServicio) === servicioId,
  );
  const proveedoresVisibles = [...proveedoresDemo, ...resultados];

  return (
    <section className="fondo-app min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <Users size={36} className="titulo-app mx-auto mb-3" />
          <h1 className="titulo-app text-3xl font-bold">
            Asignación de proveedores
          </h1>
          <p className="texto-secundario mt-3">
            Vincula proveedores a los servicios de tus negocios.
          </p>
        </header>
        <div className="superficie-app mb-6 rounded-2xl p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="negocio" className="mb-2 block font-medium">
                Seleccionar negocio
              </label>
              <select
                id="negocio"
                className="campo-app w-full"
                value={negocioId}
                onChange={(e) => setNegocioId(e.target.value)}
              >
                <option value="">Selecciona un negocio</option>
                {negocios
                  .filter((n) => n.idNegocio != null)
                  .map((n) => (
                    <option key={n.idNegocio} value={n.idNegocio}>
                      {n.nombreNegocio}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="servicio" className="mb-2 block font-medium">
                Seleccionar servicio
              </label>
              <select
                id="servicio"
                className="campo-app w-full"
                value={servicioId}
                disabled={!negocioId}
                onChange={(e) => setServicioId(e.target.value)}
              >
                <option value="">Selecciona un servicio</option>
                {servicios
                  .filter((s) => s.idServicio != null)
                  .map((s) => (
                    <option key={s.idServicio} value={s.idServicio}>
                      {s.nombre}
                    </option>
                  ))}
              </select>
              {negocioId && servicios.length === 0 && (
                <p className="texto-secundario mt-2 text-sm">
                  Este negocio todavía no tiene servicios.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="superficie-app rounded-2xl p-6">
          <h2 className="mb-5 text-2xl font-semibold">Buscar proveedores</h2>
          <div className="flex flex-wrap gap-3">
            <input
              className="campo-app min-w-0 flex-1"
              value={criterio}
              onChange={(e) => setCriterio(e.target.value)}
              placeholder="Nombre, apellido, especialidad o documento"
              disabled={!servicioId}
            />
            <button
              type="button"
              className="boton-app !w-auto inline-flex items-center gap-2 px-5"
              onClick={() => void buscar()}
              disabled={!servicioId || cargando}
            >
              <Search size={18} /> Buscar
            </button>
          </div>
          <p className="texto-secundario mt-3 text-sm">
            Ingresa al menos 3 caracteres para buscar.
          </p>
          {error && (
            <p role="alert" className="mt-4 text-red-500">
              {error}
            </p>
          )}
          {mensaje && (
            <p role="status" className="mt-4 text-green-600">
              {mensaje}
            </p>
          )}
          {servicioId && (
            <div className="mt-6 rounded-xl border border-slate-300 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">
                  Estado del servicio: {servicioSeleccionado?.nombre}
                </h3>
                <span
                  className={
                    asignados.length > 0
                      ? "font-semibold text-green-600"
                      : "texto-secundario font-semibold"
                  }
                >
                  {asignados.length > 0
                    ? "✓ Asignado"
                    : MODO_DEMO
                      ? "No asignado"
                      : "Estado por verificar"}
                </span>
              </div>
              {asignados.length > 0 ? (
                <div className="mt-5">
                  <h4 className="mb-3 font-semibold">
                    Proveedores asignados ({asignados.length})
                  </h4>
                  <div className="space-y-3">
                    {asignados.map((id) => {
                      const p = proveedoresVisibles.find(
                        (proveedor) => proveedor.idProveedor === id,
                      );
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 rounded-lg border border-slate-300 p-4"
                        >
                          <CheckCircle2
                            size={22}
                            className="shrink-0 text-green-600"
                          />
                          <div>
                            <p className="font-semibold">
                              {p
                                ? `${p.nombre} ${p.apellido}`
                                : `Proveedor #${id}`}
                            </p>
                            {p && (
                              <>
                                <p className="texto-secundario text-sm">
                                  {p.especialidad}
                                </p>
                                <p className="texto-secundario text-sm">
                                  Documento: {p.tipoDocumento}{" "}
                                  {p.numeroDocumento}
                                </p>
                              </>
                            )}
                            <p className="mt-1 text-sm text-green-600">
                              Asignado a este servicio
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="texto-secundario mt-3 text-sm">
                  {MODO_DEMO
                    ? "Este servicio todavía no tiene proveedores asignados."
                    : "Consulta el detalle del servicio en Business para confirmar sus asignaciones actuales."}
                </p>
              )}
            </div>
          )}
          {resultados.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">Resultados de búsqueda</h3>
              {resultados.map((p) => {
                const yaAsignado = asignados.includes(p.idProveedor);
                return (
                  <label
                    key={p.idProveedor}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={
                        yaAsignado || seleccionados.includes(p.idProveedor)
                      }
                      disabled={yaAsignado}
                      onChange={() => alternarProveedor(p.idProveedor)}
                    />
                    <div>
                      <p className="font-semibold">
                        {p.nombre} {p.apellido}
                      </p>
                      <p className="texto-secundario text-sm">
                        {p.especialidad}
                      </p>
                      <p className="texto-secundario text-sm">
                        Documento: {p.tipoDocumento} {p.numeroDocumento}
                      </p>
                      {yaAsignado && (
                        <p className="mt-2 text-sm text-green-600">
                          Ya asignado
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="boton-app !w-auto inline-flex items-center gap-2 px-5 py-3"
              disabled={!servicioId || seleccionados.length === 0 || cargando}
              onClick={() => void asignar()}
            >
              <UserRoundPlus size={18} />{" "}
              {cargando
                ? "Procesando..."
                : `Asignar seleccionados (${seleccionados.length})`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
