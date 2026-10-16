
import { useEffect, useState, type FormEvent } from "react";
import {
  Store,
  Plus,
  X,
  MapPin,
  Phone,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { api, type Negocio, type Moneda } from "../services/api";
import { obtenerSesion } from "../services/auth";
import { negociosDemo } from "../mocks/demo";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";
const MONEDAS_DEMO: Moneda[] = [
  { monedaCodigoIso: "COP", nombreMoneda: "Peso colombiano" },
  { monedaCodigoIso: "USD", nombreMoneda: "Dólar estadounidense" },
];

export default function Negocios() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoMonedas, setCargandoMonedas] = useState(false);
  const [error, setError] = useState("");
  const [errorMonedas, setErrorMonedas] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [identificacionFiscal, setIdentificacionFiscal] =
    useState("");
  const [monedaCodigoIso, setMonedaCodigoIso] = useState("");
  const [telefono, setTelefono] = useState("");

  const sesion = obtenerSesion();
  const token = sesion?.token ?? "";

  async function cargarNegocios() {
    if (MODO_DEMO) {
      setCargando(true);
      setNegocios([...negociosDemo]);
      setError("");
      setCargando(false);
      return;
    }
    if (!token) {
      setError("Debes iniciar sesión para consultar tus negocios.");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await api.negocios(token);

      if (!Array.isArray(respuesta)) {
        throw new Error(
          "La API devolvió un formato de negocios inesperado."
        );
      }

      setNegocios(respuesta);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los negocios."
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarMonedas() {
    if (MODO_DEMO) {
      setMonedas(MONEDAS_DEMO);
      setMonedaCodigoIso((actual) => actual || "COP");
      setErrorMonedas("");
      setCargandoMonedas(false);
      return;
    }
    setCargandoMonedas(true);
    setErrorMonedas("");

    try {
      const respuesta = await api.monedas();

      if (!Array.isArray(respuesta)) {
        throw new Error("Formato de monedas inesperado.");
      }

      setMonedas(respuesta);
      setMonedaCodigoIso((actual) => {
        if (respuesta.some(
          (m) => m.monedaCodigoIso === actual
        )) {
          return actual;
        }

        return respuesta[0]?.monedaCodigoIso ?? "";
      });
    } catch (e) {
      setErrorMonedas(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar las monedas."
      );
    } finally {
      setCargandoMonedas(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      if (MODO_DEMO) {
        if (activo) {
          setNegocios([...negociosDemo]);
          setError("");
          setCargando(false);
        }
        return;
      }
      if (!token) {
        if (activo) {
          setError("Debes iniciar sesión.");
          setCargando(false);
        }
        return;
      }

      try {
        const respuesta = await api.negocios(token);

        if (!activo) return;

        if (!Array.isArray(respuesta)) {
          throw new Error("Formato de negocios inesperado.");
        }

        setNegocios(respuesta);
      } catch (e) {
        if (activo) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudieron consultar los negocios."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    void inicializar();

    return () => {
      activo = false;
    };
  }, [token]);

  function abrirFormulario() {
    setMensaje("");
    setError("");
    setMostrarFormulario(true);
    void cargarMonedas();
  }

  function cerrarFormulario() {
    if (guardando) return;
    setMostrarFormulario(false);
    setError("");
  }

  function limpiarFormulario() {
    setNombre("");
    setDireccion("");
    setIdentificacionFiscal("");
    setTelefono("");
    setMonedaCodigoIso("");
  }

  async function guardarNegocio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!token) {
      setError("Debes iniciar sesión para registrar un negocio.");
      return;
    }

    if (!monedaCodigoIso) {
      setError("Selecciona una moneda válida.");
      return;
    }

    const datos = {
      nombreNegocio: nombre.trim(),
      direccionNegocio: direccion.trim(),
      identificacionFiscal: identificacionFiscal.trim(),
      monedaCodigoIso,
      telefono: telefono.trim(),
    };

    if (
      !datos.nombreNegocio ||
      !datos.direccionNegocio ||
      !datos.identificacionFiscal
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    setGuardando(true);

    if (MODO_DEMO) {
      const repetido = negociosDemo.some(
        (negocio) => negocio.identificacionFiscal.toLowerCase() === datos.identificacionFiscal.toLowerCase()
      );
      if (repetido) {
        setError("Ya existe un negocio con esa identificación fiscal.");
        setGuardando(false);
        return;
      }
      const siguienteId = Math.max(0, ...negociosDemo.map((n) => n.idNegocio ?? 0)) + 1;
      negociosDemo.push({ idNegocio: siguienteId, ...datos });
      setNegocios([...negociosDemo]);
      limpiarFormulario();
      setMostrarFormulario(false);
      setError("");
      setMensaje("Negocio registrado en modo demostración. No se envió a la API.");
      setGuardando(false);
      return;
    }

    try {
      await api.crearNegocio(datos, token);

      limpiarFormulario();
      setMostrarFormulario(false);

      setMensaje("Negocio registrado correctamente.");

      // Consultamos nuevamente los datos reales del backend.
      await cargarNegocios();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo registrar el negocio."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="fondo-app min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* ENCABEZADO */}
        <header className="mb-8 text-center">
          <div className="superficie-app mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
            <Store size={30} className="titulo-app" />
          </div>

          <h1 className="titulo-app text-3xl font-bold">
            Gestión de Negocios
          </h1>

          <p className="texto-secundario mt-3">
            Administra y registra tus negocios en ReservaFlow.
          </p>
        </header>

        {MODO_DEMO && (
          <p className="texto-secundario mb-5 text-center text-sm">
            Modo demostración activo · Los datos son ficticios y se perderán al recargar.
          </p>
        )}

        {/* MENSAJES */}
        {mensaje && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-green-600 p-4"
          >
            <CheckCircle2 className="text-green-600" size={22} />
            <span>{mensaje}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500 p-4"
          >
            <AlertCircle className="shrink-0 text-red-500" size={22} />
            <span>{error}</span>
          </div>
        )}

        {/* LISTADO */}
        <div className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">
                Mis negocios
              </h2>

              <p className="texto-secundario mt-1 text-sm">
                Consulta los negocios registrados.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void cargarNegocios()}
                disabled={cargando}
                className="campo-app !w-auto flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>

              <button
                type="button"
                onClick={abrirFormulario}
                className="boton-app flex items-center gap-2"
              >
                <Plus size={20} />
                Nuevo negocio
              </button>
            </div>
          </div>

          {cargando ? (
            <p className="texto-secundario py-10 text-center">
              Cargando negocios...
            </p>
          ) : negocios.length === 0 ? (
            <div className="rounded-xl border p-10 text-center"
              style={{ borderColor: "var(--borde)" }}
            >
              <Store
                size={42}
                className="titulo-app mx-auto mb-4"
              />

              <h3 className="text-xl font-semibold">
                No hay negocios para mostrar
              </h3>

              <p className="texto-secundario mt-2">
                Si aún no tienes negocios, puedes registrar uno nuevo.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {negocios.map((negocio, indice) => (
                <article
                  key={negocio.idNegocio ?? indice}
                  className="superficie-app rounded-xl p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <Store size={25} className="titulo-app" />

                    <h3 className="text-lg font-semibold">
                      {negocio.nombreNegocio}
                    </h3>
                  </div>

                  <div className="texto-secundario space-y-3 text-sm">
                    <p className="flex items-start gap-2">
                      <MapPin size={18} className="shrink-0" />
                      {negocio.direccionNegocio}
                    </p>

                    {negocio.telefono && (
                      <p className="flex items-center gap-2">
                        <Phone size={18} />
                        {negocio.telefono}
                      </p>
                    )}

                    <p>
                      <strong>Identificación fiscal:</strong>{" "}
                      {negocio.identificacionFiscal}
                    </p>

                    <p>
                      <strong>Moneda:</strong>{" "}
                      {negocio.monedaCodigoIso}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* FORMULARIO */}
        {mostrarFormulario && (
          <div
            className="superficie-app mt-8 rounded-2xl p-6 shadow-lg md:p-9"
          >
            <div className="mb-7 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">
                Registrar nuevo negocio
              </h2>

              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                aria-label="Cerrar formulario"
                className="rounded-lg p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={guardarNegocio} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="mb-2 block font-medium">
                  Nombre del negocio *
                </label>

                <input
                  id="nombre"
                  className="campo-app"
                  required
                  maxLength={120}
                  placeholder="Ej. Barbería Central"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="direccion" className="mb-2 block font-medium">
                  Dirección del negocio *
                </label>

                <input
                  id="direccion"
                  className="campo-app"
                  required
                  placeholder="Ej. Calle 10 #20-30"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="identificacion"
                  className="mb-2 block font-medium"
                >
                  Identificación fiscal *
                </label>

                <input
                  id="identificacion"
                  className="campo-app"
                  required
                  placeholder="Ej. 900123456"
                  value={identificacionFiscal}
                  onChange={(e) =>
                    setIdentificacionFiscal(e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="moneda" className="mb-2 block font-medium">
                  Moneda *
                </label>

                <select
                  id="moneda"
                  className="campo-app"
                  required
                  value={monedaCodigoIso}
                  disabled={cargandoMonedas || monedas.length === 0}
                  onChange={(e) => setMonedaCodigoIso(e.target.value)}
                >
                  <option value="">
                    {cargandoMonedas
                      ? "Cargando monedas..."
                      : "Selecciona una moneda"}
                  </option>

                  {monedas.map((moneda) => (
                    <option
                      key={moneda.monedaCodigoIso}
                      value={moneda.monedaCodigoIso}
                    >
                      {moneda.monedaCodigoIso} - {moneda.nombreMoneda}
                    </option>
                  ))}
                </select>

                {errorMonedas && (
                  <div className="mt-2">
                    <p role="alert" className="text-sm text-red-500">
                      {errorMonedas}
                    </p>

                    <button
                      type="button"
                      className="titulo-app mt-2 text-sm underline"
                      onClick={() => void cargarMonedas()}
                    >
                      Reintentar cargar monedas
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="telefono" className="mb-2 block font-medium">
                  Teléfono (opcional)
                </label>

                <input
                  id="telefono"
                  type="tel"
                  className="campo-app"
                  placeholder="Ej. 3001234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
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
                    guardando ||
                    cargandoMonedas ||
                    monedas.length === 0
                  }
                  className="boton-app disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar negocio"}
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
