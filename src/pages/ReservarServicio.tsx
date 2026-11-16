import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  api,
  type FranjaDisponible,
  type Negocio,
  type ReservaDetalle,
  type Servicio,
} from "../services/api";
import { obtenerSesion } from "../services/auth";
import { ApiError } from "../services/http";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  UserRound,
} from "lucide-react";

type NavigationState = { servicio?: Servicio; negocio?: Negocio };
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const mas30 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export default function ReservarServicio() {
  const { servicioId } = useParams();
  const id = Number(servicioId);
  const nav = useLocation().state as NavigationState | null;
  const token = obtenerSesion()?.token ?? "";
  const [fecha, setFecha] = useState(hoy);
  const [franjas, setFranjas] = useState<FranjaDisponible[]>([]);
  const [elegida, setElegida] = useState<FranjaDisponible | null>(null);
  const [notas, setNotas] = useState("");
  const [detalle, setDetalle] = useState<ReservaDetalle | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  async function consultar() {
    if (!fecha || fecha < hoy() || fecha > mas30()) {
      setError("Selecciona una fecha entre hoy y los próximos 30 días.");
      setFranjas([]);
      setElegida(null);
      return;
    }
    if (!id || !token || token === "token-demo") {
      setError("Inicia sesión con una cuenta real.");
      return;
    }
    setCargando(true);
    setError("");
    setElegida(null);
    try {
      setFranjas(await api.franjasDisponibles(id, fecha, token));
    } catch (e) {
      setFranjas([]);
      setError(
        e instanceof Error ? e.message : "Error consultando disponibilidad",
      );
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    void consultar();
  }, [id, fecha]);
  async function confirmar() {
    if (!elegida || enviando) return;
    if (notas.length > 250) {
      setError("Las notas no pueden superar los 250 caracteres.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const resultado = await api.reservar(
        {
          franjaId: elegida.idFranja,
          servicioId: id,
          proveedorId: elegida.proveedorId,
          fecha,
          horaInicio: elegida.horaInicio,
          notas,
        },
        token,
      );
      setDetalle(resultado);
      setElegida(null);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 409
          ? "Esta franja acaba de ser reservada. Elige otra."
          : e instanceof Error
            ? e.message
            : "No se pudo reservar",
      );
      try {
        setFranjas(await api.franjasDisponibles(id, fecha, token));
        setElegida(null);
      } catch {
        /* conservar error de reserva */
      }
    } finally {
      setEnviando(false);
    }
  }
  return (
    <main className="fondo-app min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/cliente/servicios"
          className="boton-secundario-app inline-flex items-center gap-2"
        >
          <ArrowLeft size={17} />
          Volver al catálogo
        </Link>
        <h1 className="titulo-app my-5 text-3xl font-bold">
          Reservar servicio
        </h1>
        <p className="texto-secundario mb-6">
          {nav?.servicio?.nombre ?? `Servicio #${id}`}{" "}
          {nav?.negocio && `· ${nav.negocio.nombreNegocio}`}
        </p>
        {detalle ? (
          <section className="superficie-app rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <CheckCircle2 className="text-emerald-500" />
              Reserva confirmada
            </h2>
            <p className="mt-3">
              Código: <strong>{detalle.codigoReserva}</strong>
            </p>
            <p>
              {detalle.nombreServicio} · {detalle.nombreNegocio}
            </p>
            <p>
              {detalle.nombreProveedor} · {detalle.fecha} · {detalle.horaInicio}
              –{detalle.horaFin}
            </p>
            <Link
              className="mt-5 inline-block rounded-xl bg-emerald-700 px-4 py-2 text-white"
              to="/reservas"
            >
              Ver mis reservas
            </Link>
          </section>
        ) : (
          <>
            <section className="superficie-app mb-5 rounded-2xl p-5">
              <h2 className="font-semibold text-lg mb-2">
                1. Elige la fecha de tu cita
              </h2>
              <p className="texto-secundario text-sm mb-4">
                Puedes consultar disponibilidad desde hoy hasta los próximos 30
                días.
              </p>
              <label className="block font-medium">
                Fecha de atención
                <input
                  className="campo-app mt-2 block w-full"
                  type="date"
                  min={hoy()}
                  max={mas30()}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="boton-secundario-app mt-3"
                onClick={() => void consultar()}
                disabled={cargando}
              >
                Actualizar disponibilidad
              </button>
            </section>
            <h2 className="titulo-app mb-3 text-xl font-bold">
              2. Selecciona un horario y proveedor
            </h2>
            {error && (
              <p role="alert" className="mb-4 text-red-600">
                {error}
              </p>
            )}
            {cargando ? (
              <p>Consultando disponibilidad…</p>
            ) : franjas.length === 0 ? (
              !error && (
                <div className="superficie-app rounded-xl p-6 text-center">
                  <CalendarDays className="titulo-app mx-auto mb-3" size={36} />
                  <h3 className="font-semibold">
                    No hay horarios disponibles para esta fecha
                  </h3>
                  <p className="texto-secundario mt-2">
                    Prueba con otro día que tenga atención para este servicio.
                  </p>
                </div>
              )
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {franjas.map((f) => (
                  <button
                    key={`${f.idFranja}-${f.proveedorId}`}
                    onClick={() => setElegida(f)}
                    className={`superficie-app rounded-xl border p-4 text-left ${elegida?.idFranja === f.idFranja ? "border-emerald-600 ring-2 ring-emerald-600" : ""}`}
                  >
                    <strong className="flex items-center gap-2">
                      <Clock3 size={18} />
                      {f.horaInicio} – {f.horaFin}
                    </strong>
                    <p className="texto-secundario mt-2 flex items-center gap-2">
                      <UserRound size={17} />
                      {f.nombreProveedor}
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold titulo-app">
                      {elegida?.idFranja === f.idFranja
                        ? "Horario seleccionado"
                        : "Seleccionar horario"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {elegida && (
              <section className="superficie-app mt-6 rounded-2xl p-5">
                <h2 className="titulo-app font-bold text-xl">
                  3. Confirma tu reserva
                </h2>
                <p>
                  {fecha} · {elegida.horaInicio} – {elegida.horaFin} ·{" "}
                  {elegida.nombreProveedor}
                </p>
                <label className="mt-4 block">
                  Notas opcionales ({notas.length}/250)
                  <textarea
                    className="campo-app mt-2 w-full rounded-xl p-3"
                    maxLength={250}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </label>
                <button
                  disabled={enviando}
                  onClick={() => void confirmar()}
                  className="mt-3 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {enviando ? "Confirmando…" : "Confirmar reserva"}
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
