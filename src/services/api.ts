// Contratos de WebAuth, Masters y Business; validar con el backend al integrar.
import { solicitudApi } from "./http";

export type Negocio = {
  idNegocio?: number;
  nombreNegocio: string;
  direccionNegocio: string;
  telefono?: string;
  identificacionFiscal: string;
  monedaCodigoIso: string;
};
export type Servicio = {
  idServicio?: number;
  negocioId: number;
  modalidadId: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precio: number;
};
export type Moneda = { monedaCodigoIso: string; nombreMoneda: string };
export type Modalidad = { idModalidad: number; nombreModalidad: string };
export type RegistroUsuario = {
  rol: string;
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  especialidad?: string;
  descripcionProfesional?: string;
};

export const api = {
  login: (correo: string, contrasena: string) =>
    solicitudApi<{ token: string; mensaje: string }>("AUTH", "/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, contrasena }),
    }),
  registrar: (payload: RegistroUsuario) =>
    solicitudApi<unknown>("MASTERS", "/api/v1/usuarios/registro", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  monedas: () => solicitudApi<Moneda[]>("MASTERS", "/api/v1/monedas"),
  modalidades: () => solicitudApi<Modalidad[]>("MASTERS", "/api/v1/modalidades"),
  negocios: (token: string) =>
    solicitudApi<Negocio[]>("BUSINESS", "/api/v1/negocios", {}, token),
  crearNegocio: (payload: Omit<Negocio, "idNegocio">, token: string) =>
    solicitudApi<unknown>(
      "BUSINESS", "/api/v1/negocios",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  serviciosPorNegocio: (id: number, token: string) =>
    solicitudApi<Servicio[]>(
      "BUSINESS", `/api/v1/servicios/negocio/${id}`,
      {},
      token,
    ),
  crearServicio: (payload: Omit<Servicio, "idServicio">, token: string) =>
    solicitudApi<unknown>(
      "BUSINESS", "/api/v1/servicios",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  recursosPorNegocio: (negocioId: number, token: string) =>
    solicitudApi<Recurso[]>(
      "BUSINESS", `/api/v1/negocios/${negocioId}/recursos`,
      {},
      token,
    ),

  crearRecurso: (negocioId: number, payload: NuevoRecurso, token: string) =>
    solicitudApi<unknown>(
      "BUSINESS", `/api/v1/negocios/${negocioId}/recursos`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),

  buscarProveedores: (criterio: string, token: string) =>
    solicitudApi<ProveedorDirectorio[]>(
      "MASTERS", `/api/v1/proveedores/directorio?criterio=${encodeURIComponent(criterio)}`,
      {},
      token,
    ),

  asignarProveedores: (
    servicioId: number,
    proveedorIds: number[],
    token: string,
  ) =>
    solicitudApi<unknown>(
      "BUSINESS", `/api/v1/servicios/${servicioId}/proveedores`,
      {
        method: "POST",
        body: JSON.stringify({ proveedorIds }),
      },
      token,
    ),
};

export type Recurso = {
  idRecurso?: number;
  nombre: string;
  tipo: string;
  cantidad: number;
  descripcion?: string;
  estado?: string;
};

export type NuevoRecurso = {
  nombre: string;
  tipo: string;
  cantidad: number;
  descripcion?: string;
};

export type ProveedorDirectorio = {
  idProveedor: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  tipoDocumento: string;
  numeroDocumento: string;
};

export type AsignacionProveedores = {
  proveedorIds: number[];
};
