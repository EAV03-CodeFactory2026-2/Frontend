import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Store, Clock3, RefreshCw, UserRound, CalendarClock, Pencil } from "lucide-react";
import { negociosDemo } from "../mocks/demo";
import { obtenerServiciosDemo, obtenerAsignacionesDemo, proveedoresDemo } from "../mocks/asignacionesDemo";
import type { Negocio, Servicio } from "../services/api";
import { CLAVE_PROVEEDOR_DEMO, obtenerProveedorDemoId, leerHorarioProveedorDemo, type DiaHorario } from "../mocks/horariosDemo";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";
type Grupo = { negocio: Negocio; servicios: Servicio[] };

export default function MisServiciosProveedor() {
  const [proveedorId, setProveedorId] = useState(obtenerProveedorDemoId);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [horario, setHorario] = useState<DiaHorario[] | null>(null);

  function cargar() {
    setHorario(MODO_DEMO ? leerHorarioProveedorDemo(proveedorId) : null);
    if (!MODO_DEMO) {
      setGrupos([]);
      return;
    }
    const asignaciones = obtenerAsignacionesDemo();
    const asignados = obtenerServiciosDemo().filter((servicio) =>
      servicio.idServicio != null &&
      (asignaciones[String(servicio.idServicio)] ?? []).includes(proveedorId)
    );
    const negocios = negociosDemo
      .map((negocio) => ({
        negocio,
        servicios: asignados.filter((servicio) => servicio.negocioId === negocio.idNegocio),
      }))
      .filter((grupo) => grupo.servicios.length > 0);
    setGrupos(negocios);
  }

  useEffect(() => {
    cargar();
  }, [proveedorId]);

  function cambiarProveedor(id: number) {
    sessionStorage.setItem(CLAVE_PROVEEDOR_DEMO, String(id));
    setProveedorId(id);
  }

  return (
    <section className="fondo-app min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 text-center">
          <div className="superficie-app mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
            <BriefcaseBusiness size={30} className="titulo-app" />
          </div>
          <h1 className="titulo-app text-3xl font-bold">Mis servicios asignados</h1>
          <p className="texto-secundario mt-3">Consulta únicamente los negocios y servicios a los que estás vinculado.</p>
        </header>

        {!MODO_DEMO ? (
          <div className="superficie-app rounded-2xl p-6 shadow-sm">
            <p>La consulta de servicios del proveedor autenticado está pendiente de conexión con el backend.</p>
            <p className="texto-secundario mt-2 text-sm">No se mostrarán datos de demostración como si fueran asignaciones reales.</p>
          </div>
        ) : (
          <>
            <div className="superficie-app mb-6 rounded-2xl p-6 shadow-sm">
              <label htmlFor="proveedor-demo" className="mb-2 flex items-center gap-2 font-semibold">
                <UserRound size={19} /> Proveedor de demostración
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <select id="proveedor-demo" className="campo-app flex-1" value={proveedorId} onChange={(e) => cambiarProveedor(Number(e.target.value))}>
                  {proveedoresDemo.map((p) => (
                    <option key={p.idProveedor} value={p.idProveedor}>{p.nombre} {p.apellido} — {p.especialidad}</option>
                  ))}
                </select>
                <button type="button" className="campo-app !w-auto flex items-center gap-2" onClick={cargar}>
                  <RefreshCw size={17} /> Actualizar
                </button>
              </div>
              <p className="texto-secundario mt-3 text-sm">Este selector existe solo para probar distintos proveedores. En producción, el proveedor se identifica por su sesión autenticada.</p>
            </div>

            {grupos.length === 0 ? (
              <div className="superficie-app rounded-2xl p-10 text-center shadow-sm">
                <BriefcaseBusiness size={40} className="titulo-app mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Todavía no tienes servicios asignados</h2>
                <p className="texto-secundario mt-2">Cuando un propietario te asigne un servicio, aparecerá aquí junto con su negocio.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {grupos.map(({ negocio, servicios }) => (
                  <section key={negocio.idNegocio} className="superficie-app rounded-2xl p-6 shadow-sm md:p-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2 text-xl font-semibold"><Store size={22} />{negocio.nombreNegocio}</h2>
                      <span className="texto-secundario text-sm">{servicios.length} servicio(s) asignado(s)</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {servicios.map((servicio) => (
                        <article key={servicio.idServicio} className="superficie-app rounded-xl border p-5">
                          <h3 className="mb-2 text-lg font-semibold">{servicio.nombre}</h3>
                          <p className="texto-secundario mb-4 text-sm">{servicio.descripcion}</p>
                          <p className="texto-secundario flex items-center gap-2 text-sm"><Clock3 size={17} />{servicio.duracionMinutos} minutos</p>
                          <p className="texto-secundario mt-2 text-sm"><strong>Precio:</strong> ${servicio.precio.toLocaleString("es-CO")}</p>
                          <p className="mt-4 font-semibold text-green-600">Asignado a mí</p>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <section className="superficie-app mt-6 rounded-2xl p-6 shadow-sm md:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <CalendarClock size={23} className="titulo-app" /> Mi horario semanal
                  </h2>
                  <p className="texto-secundario mt-2 text-sm">
                    Disponibilidad guardada para el proveedor seleccionado.
                  </p>
                </div>
                <Link to="/proveedor/horario" className="boton-app inline-flex items-center gap-2">
                  <Pencil size={17} /> Editar horario
                </Link>
              </div>

              {!horario ? (
                <div className="rounded-xl border p-5">
                  <p className="font-medium">Aún no hay un horario semanal guardado.</p>
                  <p className="texto-secundario mt-2 text-sm">
                    Configura y guarda tu horario desde la opción Mi horario.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th scope="col" className="px-4 py-3 font-semibold">Día</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Horario de atención</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horario.map((dia) => (
                        <tr key={dia.dia} className="border-b last:border-b-0">
                          <th scope="row" className="px-4 py-3 font-medium">{dia.dia}</th>
                          <td className="px-4 py-3">
                            {dia.activo && dia.bloques.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {dia.bloques.map((bloque, i) => (
                                  <span key={`${dia.dia}-${i}`} className="rounded-lg border px-3 py-1">
                                    {bloque.inicio} – {bloque.fin}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="texto-secundario">Sin atención</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="texto-secundario mt-4 text-xs">
                Horario de demostración individual del proveedor seleccionado. No corresponde aún a datos del backend.
              </p>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
