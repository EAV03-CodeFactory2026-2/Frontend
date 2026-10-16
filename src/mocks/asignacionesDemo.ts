import type { Servicio, ProveedorDirectorio } from "../services/api";
import { serviciosDemo } from "./demo";

const CLAVE_SERVICIOS = "reservaflow-servicios-demo-v2";
const CLAVE_ASIGNACIONES = "reservaflow-asignaciones-demo-v2";

export const proveedoresDemo: ProveedorDirectorio[] = [
  {
    idProveedor: 201,
    nombre: "Carlos",
    apellido: "Ruiz",
    especialidad: "Barbero",
    tipoDocumento: "CC",
    numeroDocumento: "123456",
  },
  {
    idProveedor: 202,
    nombre: "Diego",
    apellido: "Salas",
    especialidad: "Estilista",
    tipoDocumento: "CC",
    numeroDocumento: "789012",
  },
  {
    idProveedor: 203,
    nombre: "Ana",
    apellido: "Gómez",
    especialidad: "Manicurista",
    tipoDocumento: "CE",
    numeroDocumento: "456789",
  },
];

export function obtenerServiciosDemo(): Servicio[] {
  try {
    const valor = localStorage.getItem(CLAVE_SERVICIOS);
    if (valor !== null) {
      const datos: unknown = JSON.parse(valor);
      if (Array.isArray(datos)) return datos as Servicio[];
    }
  } catch {
    /* Usar servicios iniciales. */
  }
  return [...serviciosDemo];
}

export function guardarServicioDemo(servicio: Servicio): void {
  const datos = obtenerServiciosDemo();
  datos.push(servicio);
  localStorage.setItem(CLAVE_SERVICIOS, JSON.stringify(datos));
}

export function obtenerAsignacionesDemo(): Record<string, number[]> {
  try {
    const valor = localStorage.getItem(CLAVE_ASIGNACIONES);
    if (valor !== null) {
      const datos: unknown = JSON.parse(valor);
      if (datos && typeof datos === "object" && !Array.isArray(datos)) {
        const resultado: Record<string, number[]> = {};
        for (const [clave, ids] of Object.entries(datos)) {
          if (Array.isArray(ids)) {
            resultado[clave] = ids.filter(
              (id): id is number => typeof id === "number",
            );
          }
        }
        return resultado;
      }
    }
  } catch {
    /* Empezar sin asignaciones. */
  }
  return {};
}

export function guardarAsignacionDemo(servicioId: number, ids: number[]): void {
  const datos = obtenerAsignacionesDemo();
  datos[String(servicioId)] = [...new Set(ids)];
  localStorage.setItem(CLAVE_ASIGNACIONES, JSON.stringify(datos));
}
