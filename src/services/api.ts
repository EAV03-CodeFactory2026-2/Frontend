import { solicitudApi } from "./http";

export type Negocio = {
  idNegocio?: number;
  nombreNegocio: string;
  direccionNegocio: string;
  telefono: string;
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

export type Moneda = {
  monedaCodigoIso: string;
  nombreMoneda: string;
};

export type Modalidad = {
  idModalidad: number;
  nombreModalidad: string;
};

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
  idUsuario: number;
  idProveedor?: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  tipoDocumento: string;
  numeroDocumento: string;
};

export type RecursosNegocioResponse = {
  mensaje: string;
  recursos: Recurso[];
};

export type CrearRecursoResponse = {
  mensaje: string;
  recurso: Recurso;
};

export type DirectorioProveedoresResponse = {
  mensaje: string;
  proveedores: ProveedorDirectorio[];
  pagina: number;
  tamanoPagina: number;
  totalResultados: number;
  totalPaginas: number;
  hayMasPaginas: boolean;
};

export type AsignacionProveedores = {
  proveedorIds: number[];
};

export type BloqueHorarioApi = {
  horaInicio: string;
  horaFin: string;
};

export type DiaHorarioApi = {
  dia: string;
  activo: boolean;
  bloques: BloqueHorarioApi[];
};

export type HorarioSemanalApi = {
  mensaje?: string;
  fechaActualizacion?: string | null;
  dias: DiaHorarioApi[];
};

// MASTERS - Perfil y roles del usuario
export type PerfilUsuario = {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
};

export type AgregarRolPayload = {
  nombreRol: "Cliente" | "Propietario" | "Proveedor";
  tipoDocumento?: string;
  numeroDocumento?: string;
  especialidad?: string;
  descripcionProfesional?: string;
};

export const api = {
  // WEB AUTH - Autenticación
  login: (correo: string, contrasena: string) =>
    solicitudApi<{ token: string; mensaje: string }>(
      "AUTH",
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
      },
    ),

  // MASTERS - Registro de usuarios
  registrar: (payload: RegistroUsuario) =>
    solicitudApi<unknown>("MASTERS", "/api/v1/usuarios/registro", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // MASTERS - Consultar mi perfil
  miPerfil: (token: string) =>
    solicitudApi<PerfilUsuario>(
      "MASTERS",
      "/api/v1/usuarios/perfil",
      {},
      token,
    ),

  // MASTERS - Agregar un rol a mi cuenta
  agregarRol: (usuarioId: number, payload: AgregarRolPayload, token: string) =>
    solicitudApi<unknown>(
      "MASTERS",
      `/api/v1/usuarios/${usuarioId}/roles`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),

  // MASTERS - Catálogos
  monedas: () => solicitudApi<Moneda[]>("MASTERS", "/api/v1/monedas"),

  modalidades: () =>
    solicitudApi<Modalidad[]>("MASTERS", "/api/v1/modalidades"),

  // MASTERS - Negocios
  negocios: (token: string) =>
    solicitudApi<Negocio[]>("MASTERS", "/api/v1/negocios", {}, token),

  crearNegocio: (payload: Omit<Negocio, "idNegocio">, token: string) =>
    solicitudApi<unknown>(
      "MASTERS",
      "/api/v1/negocios",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),

  // MASTERS - Servicios
  serviciosPorNegocio: (id: number, token: string) =>
    solicitudApi<Servicio[]>(
      "MASTERS",
      `/api/v1/servicios/negocio/${id}`,
      {},
      token,
    ),

  crearServicio: (payload: Omit<Servicio, "idServicio">, token: string) =>
    solicitudApi<unknown>(
      "MASTERS",
      "/api/v1/servicios",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),

  // MASTERS - Recursos
  recursosPorNegocio: (negocioId: number, token: string) =>
    solicitudApi<RecursosNegocioResponse>(
      "MASTERS",
      `/api/v1/negocios/${negocioId}/recursos`,
      {},
      token,
    ),

  crearRecurso: (negocioId: number, payload: NuevoRecurso, token: string) =>
    solicitudApi<CrearRecursoResponse>(
      "MASTERS",
      `/api/v1/negocios/${negocioId}/recursos`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),

  // MASTERS - Directorio de proveedores
  buscarProveedores: (criterio: string, token: string, pagina = 1) =>
    solicitudApi<DirectorioProveedoresResponse>(
      "MASTERS",
      `/api/v1/proveedores/directorio?criterio=${encodeURIComponent(criterio)}&pagina=${pagina}`,
      {},
      token,
    ),

  // BUSINESS - Asignación de proveedores
  asignarProveedores: (
    servicioId: number,
    proveedorIds: number[],
    token: string,
  ) =>
    solicitudApi<unknown>(
      "BUSINESS",
      `/api/v1/servicios/${servicioId}/proveedores`,
      {
        method: "POST",
        body: JSON.stringify({ proveedorIds }),
      },
      token,
    ),

  // MASTERS - Consultar horario del proveedor
  obtenerMiHorario: (token: string) =>
    solicitudApi<HorarioSemanalApi>(
      "MASTERS",
      "/api/v1/proveedores/me/horario",
      {},
      token,
    ),

  // MASTERS - Guardar horario del proveedor
  guardarMiHorario: (dias: DiaHorarioApi[], token: string) =>
    solicitudApi<HorarioSemanalApi>(
      "MASTERS",
      "/api/v1/proveedores/me/horario",
      {
        method: "PUT",
        body: JSON.stringify({ dias }),
      },
      token,
    ),
};
