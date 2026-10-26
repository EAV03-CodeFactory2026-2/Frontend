import {
  Search,
  Store,
  Clock3,
  Banknote,
  Info,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, type Negocio, type Servicio } from "../services/api";
import { obtenerSesion } from "../services/auth";

type ServicioCatalogo = {
  negocio: Negocio;
  servicio: Servicio;
};

const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function ExplorarServiciosCliente() {
  const [busqueda, setBusqueda] = useState("");
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [advertencia, setAdvertencia] = useState("");

  async function cargarCatalogo() {
    const sesion = obtenerSesion();

    if (!sesion || sesion.token === "token-demo") {
      setServicios([]);
      setError("Inicia sesión con una cuenta real para consultar el catálogo.");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");
    setAdvertencia("");

    try {
      const negocios = await api.negociosDisponibles(sesion.token);

      if (!Array.isArray(negocios)) {
        throw new Error(
          "Masters devolvió un formato inesperado para los negocios.",
        );
      }

      const resultados = await Promise.allSettled(
        negocios.map(async (negocio) => {
          if (negocio.idNegocio == null) {
            return [] as ServicioCatalogo[];
          }

          const lista = await api.serviciosPorNegocio(
            negocio.idNegocio,
            sesion.token,
          );

          if (!Array.isArray(lista)) {
            throw new Error("Formato inesperado en la lista de servicios.");
          }

          return lista.map((servicio) => ({
            negocio,
            servicio,
          }));
        }),
      );

      setServicios(
        resultados.flatMap((resultado) =>
          resultado.status === "fulfilled" ? resultado.value : [],
        ),
      );

      const fallidos = resultados.filter(
        (resultado) => resultado.status === "rejected",
      ).length;

      if (fallidos > 0) {
        setAdvertencia(
          `No fue posible consultar los servicios de ${fallidos} negocio(s). Puedes volver a intentar.`,
        );
      }
    } catch (err) {
      setServicios([]);
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar el catálogo.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarCatalogo();
  }, []);

  const serviciosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-CO");

    if (!texto) return servicios;

    return servicios.filter(({ negocio, servicio }) =>
      `${negocio.nombreNegocio} ${servicio.nombre} ${servicio.descripcion ?? ""}`
        .toLocaleLowerCase("es-CO")
        .includes(texto),
    );
  }, [busqueda, servicios]);

  return (
    <section className="fondo-app min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* ENCABEZADO */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="titulo-app text-3xl font-bold">
              Explorar servicios
            </h1>

            <p className="texto-secundario mt-2">
              Descubre negocios y consulta sus servicios.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void cargarCatalogo()}
            disabled={cargando}
            className="campo-app flex items-center gap-2 rounded-xl px-4 py-2 disabled:opacity-50"
          >
            <RefreshCw size={17} className={cargando ? "animate-spin" : ""} />
            Actualizar catálogo
          </button>
        </header>

        {/* BUSCADOR */}
        <div className="superficie-app mb-6 rounded-2xl p-5 shadow-sm">
          <label htmlFor="buscar-servicios" className="mb-2 block font-medium">
            Buscar un servicio o negocio
          </label>

          <div className="relative">
            {/* LUPA */}
            <Search
              size={20}
              aria-hidden="true"
              className="texto-secundario pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2"
            />

            {/* CAMPO DE BÚSQUEDA */}
            <input
              id="buscar-servicios"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar negocio o servicio..."
              style={{
                paddingLeft: "3.25rem",
                paddingRight: "3rem",
              }}
              className="campo-app w-full rounded-xl py-3"
            />

            {/* LIMPIAR BÚSQUEDA */}
            {busqueda.length > 0 && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
                className="texto-secundario absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 hover:opacity-70"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div className="mb-6 flex items-start gap-3">
          <Info size={20} className="texto-secundario mt-0.5 shrink-0" />

          <p className="texto-secundario text-sm">
            Consulta de negocios y servicios disponibles. Las reservas en línea
            se implementarán en una próxima etapa.
          </p>
        </div>

        {/* ERRORES */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800"
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ADVERTENCIAS */}
        {advertencia && (
          <p role="status" className="texto-secundario mb-5 text-sm">
            {advertencia}
          </p>
        )}

        {/* CARGANDO */}
        {cargando ? (
          <div className="superficie-app rounded-2xl p-10 text-center">
            <p className="texto-secundario">Cargando negocios y servicios...</p>
          </div>
        ) : !error && serviciosFiltrados.length === 0 ? (
          /* SIN RESULTADOS */
          <div className="superficie-app rounded-2xl p-10 text-center">
            <div className="mb-4 flex justify-center">
              <Store size={48} className="texto-secundario opacity-60" />
            </div>

            <h2 className="titulo-app text-xl font-semibold">
              {busqueda.trim()
                ? "No encontramos resultados"
                : "No hay servicios disponibles"}
            </h2>

            <p className="texto-secundario mx-auto mt-3 max-w-md">
              {busqueda.trim()
                ? "Prueba con otro nombre de negocio o servicio."
                : "Por ahora no hay servicios para mostrar en el catálogo."}
            </p>
          </div>
        ) : !error ? (
          /* TARJETAS DE SERVICIOS */
          <div className="grid gap-5 md:grid-cols-2">
            {serviciosFiltrados.map(({ negocio, servicio }, index) => (
              <article
                key={`${negocio.idNegocio}-${servicio.idServicio ?? index}`}
                className="superficie-app rounded-2xl p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Store size={20} className="titulo-app" />

                  <span className="texto-secundario text-sm">
                    {negocio.nombreNegocio}
                  </span>
                </div>

                <h2 className="titulo-app text-xl font-semibold">
                  {servicio.nombre}
                </h2>

                <p className="texto-secundario mt-2">
                  {servicio.descripcion || "Sin descripción disponible."}
                </p>

                <div className="mt-5 flex flex-wrap gap-5">
                  <span className="flex items-center gap-2">
                    <Clock3 size={18} />
                    {servicio.duracionMinutos} minutos
                  </span>

                  <span className="flex items-center gap-2 font-semibold">
                    <Banknote size={18} />
                    {formatoPrecio.format(servicio.precio)}
                  </span>
                </div>

                <div className="mt-6 border-t pt-4">
                  <p className="texto-secundario text-sm">
                    Reserva en línea: próximamente.
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
