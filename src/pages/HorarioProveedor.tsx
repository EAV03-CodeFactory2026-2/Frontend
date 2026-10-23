import { useEffect, useState } from "react";
import {
  CalendarClock,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api, type DiaHorarioApi } from "../services/api";
import { obtenerSesion } from "../services/auth";
import { proveedoresDemo } from "../mocks/asignacionesDemo";
import {
  CLAVE_PROVEEDOR_DEMO,
  obtenerProveedorDemoId,
  obtenerNombreProveedorDemo,
  leerHorarioProveedorDemo,
  guardarHorarioProveedorDemo,
  leerHorarioAnterior,
  horarioVacio,
  type DiaHorario,
  type BloqueHorario,
} from "../mocks/horariosDemo";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";
const horarioInicial = horarioVacio;

type Bloque = BloqueHorario;

const opcionesHora = Array.from({ length: 97 }, (_, i) => {
  const minutos = i * 15;
  const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mm = String(minutos % 60).padStart(2, "0");
  return `${hh}:${mm}`;
});

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function validarHorario(dias: DiaHorario[]): string | null {
  if (!dias.some((dia) => dia.activo)) {
    return "Debes activar al menos un día de atención.";
  }

  for (const dia of dias) {
    if (!dia.activo) continue;
    if (dia.bloques.length < 1 || dia.bloques.length > 4) {
      return `${dia.dia}: debes configurar entre 1 y 4 bloques.`;
    }
    const ordenados = [...dia.bloques].sort(
      (a, b) => aMinutos(a.inicio) - aMinutos(b.inicio),
    );
    for (let i = 0; i < ordenados.length; i++) {
      const bloque = ordenados[i];
      if (aMinutos(bloque.fin) <= aMinutos(bloque.inicio)) {
        return `${dia.dia}: la hora de fin debe ser posterior a la hora de inicio.`;
      }
      if (i > 0 && aMinutos(ordenados[i - 1].fin) > aMinutos(bloque.inicio)) {
        return `${dia.dia}: los bloques horarios no pueden superponerse.`;
      }
    }
  }
  return null;
}

const nombresDias: Record<string, string> = {
  Lunes: "LUNES",
  Martes: "MARTES",
  Miércoles: "MIERCOLES",
  Jueves: "JUEVES",
  Viernes: "VIERNES",
  Sábado: "SABADO",
  Domingo: "DOMINGO",
};

function prepararHorarioApi(dias: DiaHorario[]): DiaHorarioApi[] {
  return dias.map((dia) => ({
    dia: nombresDias[dia.dia] ?? dia.dia.toUpperCase(),
    activo: dia.activo,
    bloques: dia.activo
      ? dia.bloques.map((b) => ({ horaInicio: b.inicio, horaFin: b.fin }))
      : [],
  }));
}

function convertirHorarioApi(diasApi: DiaHorarioApi[]): DiaHorario[] {
  return horarioVacio().map((dia) => {
    const codigo = nombresDias[dia.dia] ?? dia.dia.toUpperCase();
    const encontrado = diasApi.find((d) => d.dia === codigo);
    if (!encontrado) return dia;
    const bloques = (encontrado.bloques ?? []).map((b) => ({
      inicio: b.horaInicio.slice(0, 5),
      fin: b.horaFin.slice(0, 5),
    }));
    return { ...dia, activo: encontrado.activo ?? bloques.length > 0, bloques };
  });
}

export default function HorarioProveedor() {
  const [proveedorId, setProveedorId] = useState(obtenerProveedorDemoId);
  const [dias, setDias] = useState<DiaHorario[]>(horarioInicial);
  const [hayHorarioAnterior, setHayHorarioAnterior] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(!MODO_DEMO);
  const [horarioGuardado, setHorarioGuardado] = useState<DiaHorario[] | null>(
    null,
  );

  useEffect(() => {
    if (MODO_DEMO) {
      const guardado = leerHorarioProveedorDemo(proveedorId);
      setDias(guardado ?? horarioInicial());
      setHorarioGuardado(guardado);
      setHayHorarioAnterior(Boolean(leerHorarioAnterior()));
      setMensaje("");
      setError("");
      return;
    }

    let cancelado = false;
    const sesion = obtenerSesion();
    if (!sesion || sesion.rol !== "Proveedor") {
      setError(
        "Debes iniciar sesión con el rol Proveedor para consultar tu horario.",
      );
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");
    void api
      .obtenerMiHorario(sesion.token)
      .then((respuesta) => {
        if (cancelado) return;
        const horario = convertirHorarioApi(respuesta.dias ?? []);
        setDias(horario);
        setHorarioGuardado(horario);
      })
      .catch((e: unknown) => {
        if (!cancelado)
          setError(
            e instanceof Error
              ? e.message
              : "No fue posible consultar el horario.",
          );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [proveedorId]);

  function cambiarProveedor(id: number) {
    sessionStorage.setItem(CLAVE_PROVEEDOR_DEMO, String(id));
    setProveedorId(id);
  }

  function recuperarHorarioAnterior() {
    const anterior = leerHorarioAnterior();
    if (!anterior) return;
    setDias(anterior);
    setError("");
    setMensaje(
      "Horario anterior cargado para revisión. Presiona Guardar horario para asociarlo al proveedor seleccionado.",
    );
  }

  function actualizarDia(indice: number, cambio: Partial<DiaHorario>) {
    setDias((actual) =>
      actual.map((dia, i) => (i === indice ? { ...dia, ...cambio } : dia)),
    );
    setMensaje("");
    setError("");
  }

  function alternarDia(indice: number, activo: boolean) {
    const dia = dias[indice];
    actualizarDia(indice, {
      activo,
      bloques:
        activo && dia.bloques.length === 0
          ? [{ inicio: "08:00", fin: "12:00" }]
          : dia.bloques,
    });
  }

  function cambiarBloque(
    indiceDia: number,
    indiceBloque: number,
    campo: keyof Bloque,
    valor: string,
  ) {
    const bloques = dias[indiceDia].bloques.map((b, i) =>
      i === indiceBloque ? { ...b, [campo]: valor } : b,
    );
    actualizarDia(indiceDia, { bloques });
  }

  function agregarBloque(indice: number) {
    if (dias[indice].bloques.length >= 4) return;
    actualizarDia(indice, {
      bloques: [...dias[indice].bloques, { inicio: "14:00", fin: "18:00" }],
    });
  }

  function eliminarBloque(indiceDia: number, indiceBloque: number) {
    actualizarDia(indiceDia, {
      bloques: dias[indiceDia].bloques.filter((_, i) => i !== indiceBloque),
    });
  }

  async function guardar() {
    setError("");
    setMensaje("");
    const problema = validarHorario(dias);
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    try {
      const completos = dias.map((dia) => ({
        ...dia,
        bloques: dia.activo ? [...dia.bloques] : [],
      }));
      if (MODO_DEMO) {
        guardarHorarioProveedorDemo(proveedorId, completos);
        setDias(completos);
        setHorarioGuardado(completos);
        setMensaje(
          "Horario semanal guardado correctamente en modo demostración.",
        );
      } else {
        const sesion = obtenerSesion();
        if (!sesion || sesion.rol !== "Proveedor") {
          throw new Error(
            "Debes iniciar sesión con el rol Proveedor para guardar tu horario.",
          );
        }
        const respuesta = await api.guardarMiHorario(
          prepararHorarioApi(completos),
          sesion.token,
        );
        const actualizado = convertirHorarioApi(
          respuesta.dias ?? prepararHorarioApi(completos),
        );
        setDias(actualizado);
        setHorarioGuardado(actualizado);
        setMensaje("Horario semanal guardado correctamente en Masters.");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible guardar el horario.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="fondo-app min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 text-center">
          <div className="superficie-app mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
            <CalendarClock size={30} className="titulo-app" />
          </div>
          <h1 className="titulo-app text-3xl font-bold">
            Mi horario de atención
          </h1>
          <p className="texto-secundario mt-3">
            Configura los días y las franjas horarias en las que puedes atender.
          </p>
        </header>

        {MODO_DEMO && (
          <div className="superficie-app mb-6 rounded-2xl p-6 shadow-sm">
            <label
              htmlFor="proveedor-horario-demo"
              className="mb-2 block font-semibold"
            >
              Proveedor de demostración
            </label>
            <select
              id="proveedor-horario-demo"
              className="campo-app w-full"
              value={proveedorId}
              onChange={(e) => cambiarProveedor(Number(e.target.value))}
            >
              {proveedoresDemo.map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>
                  {p.nombre} {p.apellido} — {p.especialidad}
                </option>
              ))}
            </select>
            <p className="texto-secundario mt-2 text-sm">
              Estás editando el horario de{" "}
              {obtenerNombreProveedorDemo(proveedorId)}. Cada proveedor tiene su
              propio horario de prueba.
            </p>
            {hayHorarioAnterior && !leerHorarioProveedorDemo(proveedorId) && (
              <div className="mt-4 rounded-xl border p-3">
                <p className="texto-secundario text-sm">
                  Existe un horario guardado anteriormente sin identificar al
                  proveedor. No se asignará automáticamente a nadie.
                </p>
                <button
                  type="button"
                  className="campo-app !w-auto mt-3"
                  onClick={recuperarHorarioAnterior}
                >
                  Cargar horario anterior para este proveedor
                </button>
              </div>
            )}
          </div>
        )}
        <div className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Horario semanal</h2>
            <p className="texto-secundario mt-2 text-sm">
              Activa al menos un día. Puedes agregar entre uno y cuatro bloques
              de 15 minutos por día, sin superposiciones.
            </p>
          </div>

          {cargando && (
            <p role="status" className="texto-secundario mb-4">
              Cargando horario desde Masters...
            </p>
          )}
          <div className="space-y-4">
            {dias.map((dia, indiceDia) => (
              <div key={dia.dia} className="rounded-xl border p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={dia.activo}
                      onChange={(e) => alternarDia(indiceDia, e.target.checked)}
                    />
                    {dia.dia}
                  </label>
                  <span className="texto-secundario text-sm">
                    {dia.activo
                      ? `${dia.bloques.length} bloque(s)`
                      : "Sin atención"}
                  </span>
                </div>

                {dia.activo && (
                  <div className="mt-4 space-y-3">
                    {dia.bloques.map((bloque, indiceBloque) => (
                      <div
                        key={indiceBloque}
                        className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <label
                            className="mb-1 block text-sm"
                            htmlFor={`inicio-${indiceDia}-${indiceBloque}`}
                          >
                            Hora de inicio
                          </label>
                          <select
                            id={`inicio-${indiceDia}-${indiceBloque}`}
                            className="campo-app w-full"
                            value={bloque.inicio}
                            onChange={(e) =>
                              cambiarBloque(
                                indiceDia,
                                indiceBloque,
                                "inicio",
                                e.target.value,
                              )
                            }
                          >
                            {opcionesHora.slice(0, -1).map((hora) => (
                              <option key={hora} value={hora}>
                                {hora}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="mb-1 block text-sm"
                            htmlFor={`fin-${indiceDia}-${indiceBloque}`}
                          >
                            Hora de fin
                          </label>
                          <select
                            id={`fin-${indiceDia}-${indiceBloque}`}
                            className="campo-app w-full"
                            value={bloque.fin}
                            onChange={(e) =>
                              cambiarBloque(
                                indiceDia,
                                indiceBloque,
                                "fin",
                                e.target.value,
                              )
                            }
                          >
                            {opcionesHora.slice(1).map((hora) => (
                              <option key={hora} value={hora}>
                                {hora}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          aria-label={`Eliminar bloque ${indiceBloque + 1} de ${dia.dia}`}
                          title="Eliminar bloque"
                          className="campo-app !w-auto inline-flex items-center justify-center gap-2"
                          onClick={() =>
                            eliminarBloque(indiceDia, indiceBloque)
                          }
                        >
                          <Trash2 size={18} />{" "}
                          <span className="sm:hidden">Eliminar bloque</span>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="campo-app !w-auto inline-flex items-center gap-2 disabled:opacity-50"
                      onClick={() => agregarBloque(indiceDia)}
                      disabled={dia.bloques.length >= 4}
                    >
                      <Plus size={17} /> Agregar bloque
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 text-red-500"
            >
              <AlertCircle size={20} className="shrink-0" /> {error}
            </p>
          )}
          {mensaje && (
            <p
              role="status"
              className="mt-6 flex items-start gap-2 text-green-600"
            >
              <CheckCircle2 size={20} className="shrink-0" /> {mensaje}
            </p>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="boton-app !w-auto inline-flex items-center gap-2 px-6 py-3 disabled:opacity-50"
              disabled={
                guardando ||
                cargando ||
                (!MODO_DEMO &&
                  (!obtenerSesion() || obtenerSesion()?.rol !== "Proveedor"))
              }
              onClick={() => void guardar()}
            >
              <Save size={19} />{" "}
              {guardando ? "Guardando..." : "Guardar horario"}
            </button>
          </div>
        </div>
        {horarioGuardado && (
          <section className="superficie-app mt-6 rounded-2xl p-6 shadow-sm md:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <CalendarClock size={24} className="titulo-app" /> Resumen del
              horario guardado
            </h2>
            <p className="texto-secundario mt-2 mb-5 text-sm">
              {MODO_DEMO
                ? `Horario registrado para ${obtenerNombreProveedorDemo(proveedorId)}.`
                : "Horario del proveedor autenticado."}{" "}
              Esta tabla refleja únicamente los cambios guardados.
            </p>
            {!horarioGuardado ? (
              <p className="texto-secundario rounded-xl border p-5">
                Todavía no has guardado un horario para este proveedor.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3">Día</th>
                      <th className="px-4 py-3">Horario de atención</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarioGuardado.map((dia) => (
                      <tr key={dia.dia} className="border-b last:border-b-0">
                        <th scope="row" className="px-4 py-3 font-medium">
                          {dia.dia}
                        </th>
                        <td className="px-4 py-3">
                          {dia.activo && dia.bloques.length ? (
                            dia.bloques
                              .map((b) => `${b.inicio} – ${b.fin}`)
                              .join(" | ")
                          ) : (
                            <span className="texto-secundario">
                              Sin atención
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        <p className="texto-secundario mt-8 text-center text-sm">
          ReservaFlow · Plataforma de gestión de reservas
        </p>
      </div>
    </section>
  );
}
