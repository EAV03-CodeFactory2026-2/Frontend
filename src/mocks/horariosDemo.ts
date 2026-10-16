import { proveedoresDemo } from "./asignacionesDemo";

export type BloqueHorario = { inicio: string; fin: string };
export type DiaHorario = { dia: string; activo: boolean; bloques: BloqueHorario[] };

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
export const CLAVE_PROVEEDOR_DEMO = "reservaflow-proveedor-demo-id";
const CLAVE_ANTERIOR = "reservaflow-horario-proveedor-demo";
const CLAVE_ACTUAL = "reservaflow-horario-proveedor-demo-v2-";

export function obtenerProveedorDemoId(): number {
  const id = Number(sessionStorage.getItem(CLAVE_PROVEEDOR_DEMO));
  return proveedoresDemo.some(p => p.idProveedor === id) ? id : 201;
}
export function obtenerNombreProveedorDemo(id: number): string {
  const p = proveedoresDemo.find(p => p.idProveedor === id);
  return p ? `${p.nombre} ${p.apellido}` : `Proveedor #${id}`;
}
export function horarioVacio(): DiaHorario[] {
  return DIAS_SEMANA.map(dia => ({ dia, activo: false, bloques: [] }));
}
function validarEstructura(datos: unknown): datos is DiaHorario[] {
  if (!Array.isArray(datos) || datos.length !== 7) return false;
  return datos.every((dato, i) => {
    if (!dato || typeof dato !== "object") return false;
    const d = dato as Partial<DiaHorario>;
    return d.dia === DIAS_SEMANA[i] && typeof d.activo === "boolean" &&
      Array.isArray(d.bloques) && d.bloques.every(b =>
        b && typeof b.inicio === "string" && typeof b.fin === "string"
      );
  });
}
export function leerHorarioProveedorDemo(id: number): DiaHorario[] | null {
  try {
    const texto = localStorage.getItem(`${CLAVE_ACTUAL}${id}`);
    if (!texto) return null;
    const datos: unknown = JSON.parse(texto);
    return validarEstructura(datos) ? datos : null;
  } catch { return null; }
}
export function guardarHorarioProveedorDemo(id: number, horario: DiaHorario[]): void {
  localStorage.setItem(`${CLAVE_ACTUAL}${id}`, JSON.stringify(horario));
}
export function leerHorarioAnterior(): DiaHorario[] | null {
  try {
    const texto = localStorage.getItem(CLAVE_ANTERIOR);
    if (!texto) return null;
    const datos: unknown = JSON.parse(texto);
    return validarEstructura(datos) ? datos : null;
  } catch { return null; }
}
