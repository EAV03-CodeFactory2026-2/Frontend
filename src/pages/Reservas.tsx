import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  RefreshCw,
  Eye,
  X,
  CalendarDays,
  Clock3,
  UserRound,
  Timer,
  Wallet,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Store,
  FileText,
} from "lucide-react";

import {
  api,
  type MisReservas,
  type ReservaDetalle,
  type ReservaResumen,
} from "../services/api";

import { obtenerSesion } from "../services/auth";

export default function Reservas() {
  const token = obtenerSesion()?.token ?? "";

  const [datos, setDatos] = useState<MisReservas | null>(null);
  const [detalle, setDetalle] = useState<ReservaDetalle | null>(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      setDatos(await api.misReservas(token));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron consultar las reservas.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function ver(id: number) {
    setError("");
    setMensaje("");

    try {
      setDetalle(await api.detalleReserva(id, token));
      setMotivo("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible consultar el detalle.",
      );
    }
  }

  async function cancelar() {
    if (!detalle || ocupado) return;

    const confirmado = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva?",
    );

    if (!confirmado) return;

    setOcupado(true);
    setError("");
    setMensaje("");

    try {
      await api.cancelarReserva(detalle.idReserva, motivo, token);

      setDetalle(null);
      await cargar();
      setMensaje("Tu reserva fue cancelada correctamente.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible cancelar la reserva.",
      );
    } finally {
      setOcupado(false);
    }
  }

  const formatoFecha = (fecha: string) => {
    if (!fecha) return "No indicada";

    return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatoFechaHora = (fecha?: string) => {
    if (!fecha) return "No indicada";

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) return fecha;

    return valor.toLocaleString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatoPrecio = (precio?: number, moneda?: string) => {
    if (precio === undefined || precio === null) {
      return "No indicado";
    }

    return `${Number(precio).toLocaleString("es-CO")} ${moneda || "COP"}`;
  };

  const estadoClase = (estado: string) => {
    const normalizado = estado.toLowerCase();

    if (normalizado === "confirmada") {
      return "estado-confirmada";
    }

    if (normalizado === "cancelada") {
      return "estado-cancelada";
    }

    return "estado-realizada";
  };

  const puedeCancelar =
    detalle?.estado?.toLowerCase() === "confirmada" &&
    new Date(`${detalle.fecha}T${detalle.horaInicio}`).getTime() - Date.now() >=
      2 * 60 * 60 * 1000;

  // Tarjeta para mostrar cada reserva
  function listado(titulo: string, items: ReservaResumen[]) {
    return (
      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="titulo-app text-xl font-bold">{titulo}</h2>

          <span className="superficie-app rounded-full px-4 py-1 text-sm font-semibold">
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="superficie-app rounded-2xl p-8 text-center">
            <CalendarDays size={30} className="titulo-app mx-auto mb-3" />

            <p className="texto-secundario">
              {titulo === "Próximas"
                ? "No tienes próximas reservas."
                : "Todavía no tienes reservas en el historial."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((reserva) => (
              <article
                key={reserva.idReserva}
                className="superficie-app rounded-2xl p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold">
                      {reserva.nombreServicio}
                    </h3>

                    <p className="texto-secundario mt-1 flex items-center gap-2 text-sm">
                      <Store size={16} />
                      {reserva.nombreNegocio}
                    </p>
                  </div>

                  <span
                    className={`estado-reserva ${estadoClase(reserva.estado)}`}
                  >
                    {reserva.estado}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="titulo-app" />

                    <span className="text-sm">
                      {formatoFecha(reserva.fecha)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 size={18} className="titulo-app" />

                    <span className="text-sm">
                      {reserva.horaInicio} – {reserva.horaFin}
                    </span>
                  </div>
                </div>

                <div
                  className="mt-5 border-t pt-4"
                  style={{
                    borderColor: "var(--borde)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => void ver(reserva.idReserva)}
                    className="boton-secundario-app"
                  >
                    <Eye size={17} />
                    Ver detalle
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Campo reutilizable para el detalle
  function CampoDetalle({
    icono,
    etiqueta,
    valor,
  }: {
    icono: React.ReactNode;
    etiqueta: string;
    valor: React.ReactNode;
  }) {
    return (
      <div className="min-w-0">
        <div className="texto-secundario mb-1 flex items-center gap-2 text-sm">
          {icono}
          <span>{etiqueta}</span>
        </div>

        <p className="break-words font-semibold">{valor}</p>
      </div>
    );
  }

  return (
    <main className="fondo-app min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ENCABEZADO */}

        <header className="mb-8">
          <h1 className="titulo-app text-3xl font-bold">Mis reservas</h1>

          <p className="texto-secundario mt-2">
            Consulta tus próximas citas, revisa tu historial y administra tus
            reservas.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/cliente/servicios"
              className="boton-app inline-flex items-center gap-2 no-underline"
            >
              <CalendarPlus size={18} />
              Explorar y reservar
            </Link>

            <button
              type="button"
              className="boton-secundario-app"
              disabled={cargando}
              onClick={() => void cargar()}
            >
              <RefreshCw size={18} />
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        {/* MENSAJES */}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500"
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-500"
          >
            {mensaje}
          </div>
        )}

        {/* LISTADO */}

        {!datos ? (
          <div className="superficie-app rounded-2xl p-8 text-center">
            {cargando
              ? "Cargando reservas..."
              : "No fue posible cargar las reservas."}
          </div>
        ) : (
          <>
            {listado("Próximas", datos.proximas)}
            {listado("Historial", datos.historial)}
          </>
        )}

        {/* DETALLE DE LA RESERVA */}

        {detalle && (
          <section
            className="superficie-app mt-10 rounded-2xl p-5 shadow-sm md:p-7"
            aria-label="Detalle de la reserva"
          >
            {/* ENCABEZADO DETALLE */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="titulo-app text-2xl font-bold">
                  Detalle de la reserva
                </h2>

                <p className="texto-secundario mt-1 text-sm">
                  Información de tu cita
                </p>
              </div>

              <button
                type="button"
                className="boton-secundario-app"
                onClick={() => setDetalle(null)}
              >
                <X size={18} />
                Cerrar
              </button>
            </div>

            {/* TARJETA PRINCIPAL */}

            <div className="superficie-app rounded-2xl p-5 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="texto-secundario text-xs font-semibold uppercase tracking-wide">
                    Código de reserva
                  </p>

                  <p className="titulo-app mt-1 text-xl font-bold">
                    {detalle.codigoReserva}
                  </p>
                </div>

                <span
                  className={`estado-reserva ${estadoClase(detalle.estado)}`}
                >
                  {detalle.estado}
                </span>
              </div>

              {/* SERVICIO Y NEGOCIO */}

              <div className="mt-7">
                <h3 className="text-2xl font-bold">{detalle.nombreServicio}</h3>

                <p className="texto-secundario mt-2 flex items-start gap-2">
                  <Store size={19} className="mt-1 shrink-0" />
                  {detalle.nombreNegocio}
                </p>
              </div>

              <div
                className="my-7 border-t"
                style={{
                  borderColor: "var(--borde)",
                }}
              />

              {/* INFORMACIÓN EN DOS COLUMNAS */}

              <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                <CampoDetalle
                  icono={<UserRound size={17} />}
                  etiqueta="Proveedor"
                  valor={detalle.nombreProveedor}
                />

                <CampoDetalle
                  icono={<CalendarDays size={17} />}
                  etiqueta="Fecha"
                  valor={formatoFecha(detalle.fecha)}
                />

                <CampoDetalle
                  icono={<Clock3 size={17} />}
                  etiqueta="Horario"
                  valor={`${detalle.horaInicio} – ${detalle.horaFin}`}
                />

                <CampoDetalle
                  icono={<Timer size={17} />}
                  etiqueta="Duración"
                  valor={`${detalle.duracionMinutos} minutos`}
                />

                <CampoDetalle
                  icono={<Wallet size={17} />}
                  etiqueta="Precio"
                  valor={formatoPrecio(detalle.precio, detalle.moneda)}
                />

                <CampoDetalle
                  icono={<CalendarCheck size={17} />}
                  etiqueta="Fecha de creación"
                  valor={formatoFechaHora(detalle.fechaCreacion)}
                />
              </div>

              {/* NOTAS */}

              {detalle.notas && (
                <div
                  className="mt-7 border-t pt-5"
                  style={{
                    borderColor: "var(--borde)",
                  }}
                >
                  <div className="texto-secundario mb-2 flex items-center gap-2">
                    <FileText size={18} />
                    Notas de la reserva
                  </div>

                  <p>{detalle.notas}</p>
                </div>
              )}

              {/* INFORMACIÓN DE CANCELACIÓN */}

              {detalle.fechaCancelacion && (
                <div className="mt-7 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex items-center gap-2 font-semibold text-red-500">
                    <XCircle size={18} />
                    Reserva cancelada
                  </div>

                  <p className="mt-2 text-sm">
                    Fecha de cancelación:{" "}
                    {formatoFechaHora(detalle.fechaCancelacion)}
                  </p>

                  <p className="mt-1 text-sm">
                    Motivo: {detalle.motivoCancelacion || "No indicado"}
                  </p>
                </div>
              )}
            </div>

            {/* SECCIÓN CANCELAR */}

            {puedeCancelar && (
              <div className="mt-7">
                <h3 className="text-lg font-bold">Cancelar esta reserva</h3>

                <p className="texto-secundario mt-2 text-sm">
                  Si no puedes asistir, puedes cancelar tu cita hasta 2 horas
                  antes de su inicio.
                </p>

                <label
                  htmlFor="motivo-cancelacion"
                  className="mt-5 block font-medium"
                >
                  Motivo de cancelación (opcional)
                </label>

                <textarea
                  id="motivo-cancelacion"
                  className="campo-app mt-2 w-full"
                  rows={3}
                  maxLength={250}
                  placeholder="Escribe el motivo si deseas..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    className="boton-secundario-app"
                    onClick={() => setDetalle(null)}
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    className="boton-peligro-app"
                    disabled={ocupado}
                    onClick={() => void cancelar()}
                  >
                    <XCircle size={18} />

                    {ocupado ? "Cancelando..." : "Cancelar reserva"}
                  </button>
                </div>

                <p className="texto-secundario mt-3 flex items-center justify-end gap-2 text-xs">
                  <CheckCircle2 size={15} />
                  Se solicitará confirmación antes de cancelar.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
