import { useEffect, useState, type FormEvent } from "react";
import { Boxes, Plus, RefreshCw } from "lucide-react";
import { api, type Negocio, type Recurso } from "../services/api";
import { obtenerSesion } from "../services/auth";
import { negociosDemo } from "../mocks/demo";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";

const CLAVE_RECURSOS = "reservaflow-recursos-demo";

type RecursosPorNegocio = Record<string, Recurso[]>;

// ========================================
// FUNCIONES PARA EL MODO DEMOSTRACIÓN
// ========================================

function leerRecursosDemo(): RecursosPorNegocio {
  try {
    const guardados = localStorage.getItem(CLAVE_RECURSOS);

    if (!guardados) {
      return {};
    }

    const datos: unknown = JSON.parse(guardados);

    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      return {};
    }

    return datos as RecursosPorNegocio;
  } catch {
    return {};
  }
}

function guardarRecursosDemo(negocioId: number, recursos: Recurso[]) {
  const datos = leerRecursosDemo();

  datos[String(negocioId)] = recursos;

  localStorage.setItem(CLAVE_RECURSOS, JSON.stringify(datos));
}

// Normaliza nombres para validar duplicados.
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function Recursos() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [negocioId, setNegocioId] = useState("");
  const [recursos, setRecursos] = useState<Recurso[]>([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [descripcion, setDescripcion] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [cargando, setCargando] = useState(false);
  const [cargandoRecursos, setCargandoRecursos] = useState(false);

  const sesion = obtenerSesion();
  const token = sesion?.token ?? "";

  // ========================================
  // CARGAR NEGOCIOS
  // ========================================

  useEffect(() => {
    let activo = true;

    async function cargarNegocios() {
      try {
        const datos = MODO_DEMO ? [...negociosDemo] : await api.negocios(token);

        if (activo) {
          setNegocios(datos);
        }
      } catch (e) {
        if (activo) {
          setError(
            e instanceof Error ? e.message : "Error al cargar los negocios.",
          );
        }
      }
    }

    void cargarNegocios();

    return () => {
      activo = false;
    };
  }, [token]);

  // ========================================
  // CARGAR RECURSOS AL CAMBIAR DE NEGOCIO
  // ========================================

  useEffect(() => {
    let activo = true;

    async function cargarRecursos() {
      if (!negocioId) {
        setRecursos([]);
        return;
      }

      setCargandoRecursos(true);
      setError("");

      try {
        const id = Number(negocioId);

        const datos = MODO_DEMO
          ? (leerRecursosDemo()[String(id)] ?? [])
          : (await api.recursosPorNegocio(id, token)).recursos;

        if (activo) {
          setRecursos(datos);
        }
      } catch (e) {
        if (activo) {
          setRecursos([]);

          setError(
            e instanceof Error ? e.message : "Error al cargar los recursos.",
          );
        }
      } finally {
        if (activo) {
          setCargandoRecursos(false);
        }
      }
    }

    void cargarRecursos();

    return () => {
      activo = false;
    };
  }, [negocioId, token]);

  // ========================================
  // ACTUALIZAR LISTADO
  // ========================================

  async function actualizarRecursos() {
    if (!negocioId || cargandoRecursos) {
      return;
    }

    setError("");
    setMensaje("");
    setCargandoRecursos(true);

    try {
      const id = Number(negocioId);

      const datos = MODO_DEMO
        ? (leerRecursosDemo()[String(id)] ?? [])
        : (await api.recursosPorNegocio(id, token)).recursos;

      setRecursos(datos);

      setMensaje("Listado de recursos actualizado correctamente.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron actualizar los recursos.",
      );
    } finally {
      setCargandoRecursos(false);
    }
  }

  // ========================================
  // CONTROL DEL FORMULARIO
  // ========================================

  function limpiarFormulario() {
    setNombre("");
    setTipo("");
    setCantidad("1");
    setDescripcion("");
  }

  function abrirFormulario() {
    if (!negocioId) {
      return;
    }

    limpiarFormulario();

    setError("");
    setMensaje("");

    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    if (cargando) {
      return;
    }

    setMostrarFormulario(false);
    setError("");

    limpiarFormulario();
  }

  // ========================================
  // REGISTRAR RECURSO
  // ========================================

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMensaje("");

    const id = Number(negocioId);

    const nombreLimpio = nombre.trim();
    const tipoLimpio = tipo.trim();

    const cantidadNumero = Number(cantidad);

    // Validar negocio
    if (!id) {
      setError("Selecciona un negocio.");
      return;
    }

    // Validar campos obligatorios
    if (!nombreLimpio || !tipoLimpio) {
      setError("El nombre y el tipo de recurso son obligatorios.");
      return;
    }

    // Validar cantidad
    if (
      cantidad.trim() === "" ||
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero < 1 ||
      cantidadNumero > 999
    ) {
      setError("La cantidad debe ser un número entero entre 1 y 999.");
      return;
    }

    // Consultar recursos actuales
    const recursosActuales = MODO_DEMO
      ? (leerRecursosDemo()[String(id)] ?? [])
      : recursos;

    // Validar nombre duplicado
    const existeDuplicado = recursosActuales.some(
      (recurso) => normalizar(recurso.nombre) === normalizar(nombreLimpio),
    );

    if (existeDuplicado) {
      setError("Ya existe un recurso con este nombre en el negocio.");
      return;
    }

    // Datos que se envían al backend
    const payload = {
      nombre: nombreLimpio,
      tipo: tipoLimpio,
      cantidad: cantidadNumero,
      descripcion: descripcion.trim(),
    };

    setCargando(true);

    try {
      if (MODO_DEMO) {
        // Registrar recurso de demostración
        const nuevo: Recurso = {
          ...payload,
          idRecurso: Date.now(),
          estado: "Activo",
        };

        const actualizados = [...recursosActuales, nuevo];

        guardarRecursosDemo(id, actualizados);

        setRecursos(actualizados);
      } else {
        // Registrar recurso en Masters
        await api.crearRecurso(id, payload, token);

        // Consultar listado actualizado
        const respuesta = await api.recursosPorNegocio(id, token);

        setRecursos(respuesta.recursos);
      }

      // Cerrar y limpiar formulario
      setMostrarFormulario(false);
      limpiarFormulario();

      setMensaje("Recurso registrado correctamente.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo registrar el recurso.",
      );
    } finally {
      setCargando(false);
    }
  }

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <section className="fondo-app min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        {/* ENCABEZADO */}

        <header className="mb-8 text-center">
          <Boxes className="titulo-app mx-auto mb-3" size={36} />

          <h1 className="titulo-app text-3xl font-bold">Gestión de Recursos</h1>

          <p className="texto-secundario mt-3">
            Administra los recursos de tus negocios.
          </p>
        </header>

        {/* SELECCIONAR NEGOCIO */}

        <div className="superficie-app mb-6 rounded-2xl p-6">
          <label htmlFor="negocio" className="mb-2 block font-medium">
            Seleccionar negocio
          </label>

          <select
            id="negocio"
            className="campo-app w-full"
            value={negocioId}
            onChange={(e) => {
              setNegocioId(e.target.value);
              setMensaje("");
              setError("");
              setMostrarFormulario(false);
            }}
          >
            <option value="">Selecciona un negocio</option>

            {negocios.map((negocio) => (
              <option key={negocio.idNegocio} value={negocio.idNegocio}>
                {negocio.nombreNegocio}
              </option>
            ))}
          </select>
        </div>

        {/* LISTADO DE RECURSOS */}

        <div className="superficie-app rounded-2xl p-6">
          {/* TÍTULO Y BOTONES */}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Mis recursos</h2>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {/* BOTÓN ACTUALIZAR */}

              <button
                type="button"
                className="campo-app !w-auto inline-flex items-center justify-center gap-2 px-4 py-3"
                disabled={!negocioId || cargandoRecursos}
                onClick={() => void actualizarRecursos()}
              >
                <RefreshCw size={18} />

                {cargandoRecursos ? "Actualizando..." : "Actualizar"}
              </button>

              {/* BOTÓN NUEVO RECURSO */}

              <button
                type="button"
                className="boton-app !w-auto inline-flex items-center justify-center gap-2 px-4 py-3"
                disabled={!negocioId}
                onClick={abrirFormulario}
              >
                <Plus size={18} />
                Nuevo recurso
              </button>
            </div>
          </div>

          {/* MENSAJES */}

          {mensaje && (
            <p role="status" className="mb-4 text-green-600">
              {mensaje}
            </p>
          )}

          {!mostrarFormulario && error && (
            <p role="alert" className="mb-4 text-red-500">
              {error}
            </p>
          )}

          {/* CONTENIDO DEL LISTADO */}

          {!negocioId ? (
            <p className="texto-secundario">
              Selecciona un negocio para consultar sus recursos.
            </p>
          ) : cargandoRecursos ? (
            <p className="texto-secundario">Cargando recursos...</p>
          ) : recursos.length === 0 ? (
            <p className="texto-secundario">
              No hay recursos registrados para este negocio.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recursos.map((recurso, indice) => (
                <article
                  key={recurso.idRecurso ?? indice}
                  className="rounded-xl border border-slate-200 p-5 dark:border-slate-600"
                >
                  <h3 className="text-xl font-semibold">{recurso.nombre}</h3>

                  <p className="texto-secundario mt-2">
                    {recurso.descripcion || "Sin descripción"}
                  </p>

                  <div className="mt-3 space-y-1">
                    <p>Tipo: {recurso.tipo}</p>

                    <p>Cantidad: {recurso.cantidad}</p>

                    <p>Estado: {recurso.estado ?? "Activo"}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          MODAL REGISTRAR RECURSO
         ======================================== */}

      {mostrarFormulario && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarFormulario();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-recurso"
            className="superficie-app max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 shadow-2xl md:p-8"
          >
            {/* TÍTULO DEL MODAL */}

            <div className="mb-6">
              <h2
                id="titulo-modal-recurso"
                className="titulo-app text-2xl font-semibold"
              >
                Registrar nuevo recurso
              </h2>
            </div>

            {/* FORMULARIO */}

            <form onSubmit={guardar} className="space-y-5">
              {/* NOMBRE */}

              <div>
                <label htmlFor="nombre" className="mb-2 block font-medium">
                  Nombre del recurso *
                </label>

                <input
                  id="nombre"
                  className="campo-app w-full"
                  required
                  autoFocus
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Silla de barbería"
                />
              </div>

              {/* TIPO */}

              <div>
                <label htmlFor="tipo" className="mb-2 block font-medium">
                  Tipo de recurso *
                </label>

                <input
                  id="tipo"
                  className="campo-app w-full"
                  required
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  placeholder="Ej. Equipo"
                />
              </div>

              {/* CANTIDAD */}

              <div>
                <label htmlFor="cantidad" className="mb-2 block font-medium">
                  Cantidad *
                </label>

                <input
                  id="cantidad"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  className="campo-app w-full"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div>
                <label htmlFor="descripcion" className="mb-2 block font-medium">
                  Descripción (opcional)
                </label>

                <textarea
                  id="descripcion"
                  className="campo-app w-full"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el recurso"
                />
              </div>

              {/* ERROR */}

              {error && (
                <p role="alert" className="text-sm text-red-500">
                  {error}
                </p>
              )}

              {/* BOTONES DEL FORMULARIO */}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="campo-app !w-auto px-5 py-3"
                  disabled={cargando}
                  onClick={cerrarFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-app !w-auto px-5 py-3"
                  disabled={cargando}
                >
                  {cargando ? "Guardando..." : "Guardar recurso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
