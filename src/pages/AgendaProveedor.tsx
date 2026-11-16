import { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarCheck2,
  RefreshCw,
  Clock3,
  MapPin,
  UserRound,
  Phone,
  StickyNote,
} from "lucide-react";
import { api, type Agenda } from "../services/api";
import { obtenerSesion } from "../services/auth";
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fechaLegible = (f: string) =>
  new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export default function AgendaProveedor() {
  const [fecha, setFecha] = useState(hoy);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  async function cargar() {
    setError("");
    setCargando(true);
    try {
      setAgenda(await api.miAgenda(fecha, obtenerSesion()?.token ?? ""));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible consultar la agenda",
      );
      setAgenda(null);
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    void cargar();
  }, [fecha]);
  return (
    <main className="fondo-app min-h-screen px-5 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <CalendarDays className="titulo-app" size={30} />
            <h1 className="titulo-app text-3xl font-bold">Mi agenda diaria</h1>
          </div>
          <p className="texto-secundario mt-2">
            Consulta tus citas confirmadas, los clientes que atenderás y sus
            indicaciones.
          </p>
        </header>
        <section className="superficie-app rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block flex-1 font-semibold">
              Fecha de atención
              <input
                type="date"
                className="campo-app mt-2 block"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="boton-secundario-app"
                onClick={() => setFecha(hoy())}
              >
                Hoy
              </button>
              <button
                type="button"
                className="boton-app inline-flex items-center gap-2"
                disabled={cargando}
                onClick={() => void cargar()}
              >
                <RefreshCw size={18} />
                {cargando ? "Actualizando…" : "Actualizar agenda"}
              </button>
            </div>
          </div>
        </section>
        {error && (
          <p
            role="alert"
            className="superficie-app rounded-xl border-l-4 border-red-500 p-4 text-red-500"
          >
            {error}
          </p>
        )}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold capitalize">
              {fechaLegible(fecha)}
            </h2>
            <p className="texto-secundario text-sm">
              Reservas confirmadas para esta fecha
            </p>
          </div>
          <div className="superficie-app rounded-xl px-5 py-3">
            <span className="titulo-app text-2xl font-bold">
              {agenda?.totalReservas ?? 0}
            </span>
            <span className="texto-secundario ml-2">
              {agenda?.totalReservas === 1 ? "cita" : "citas"}
            </span>
          </div>
        </section>
        {cargando && !agenda ? (
          <p role="status">Consultando tu agenda…</p>
        ) : agenda?.reservas.length === 0 ? (
          <section className="superficie-app rounded-2xl p-10 text-center">
            <CalendarCheck2 size={42} className="titulo-app mx-auto mb-3" />
            <h3 className="text-lg font-semibold">
              No tienes reservas para este día
            </h3>
            <p className="texto-secundario mt-2">
              Puedes elegir otra fecha para consultar tus citas.
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {agenda?.reservas.map((r) => (
              <article
                key={r.idReserva}
                className="superficie-app rounded-2xl p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="titulo-app flex items-center gap-2 font-bold">
                      <Clock3 size={19} />
                      {r.horaInicio} – {r.horaFin}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">
                      {r.nombreServicio}
                    </h3>
                    <p className="texto-secundario mt-1 flex items-center gap-2">
                      <MapPin size={16} />
                      {r.nombreNegocio}
                    </p>
                  </div>
                  <span className="estado-reserva estado-confirmada self-start">
                    Confirmada
                  </span>
                </div>
                <div
                  className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2"
                  style={{ borderColor: "var(--borde)" }}
                >
                  <p className="flex items-start gap-2">
                    <UserRound size={18} className="mt-1 shrink-0" />
                    <span>
                      <strong>Cliente</strong>
                      <br />
                      {r.nombreCliente}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Phone size={18} className="mt-1 shrink-0" />
                    <span>
                      <strong>Teléfono</strong>
                      <br />
                      {r.telefonoCliente || "No registrado"}
                    </span>
                  </p>
                  <p className="flex items-start gap-2 sm:col-span-2">
                    <StickyNote size={18} className="mt-1 shrink-0" />
                    <span>
                      <strong>Indicaciones del cliente</strong>
                      <br />
                      {r.notas || "Sin indicaciones adicionales"}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
