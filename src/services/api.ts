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

export type ProveedorAsignado = {
  idUsuario: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  tipoDocumento: string;
  numeroDocumento: string;
};

export type ServicioAsignado = {
  idServicio: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precio: number;
  estado: string;
  idNegocio: number | null;
  nombreNegocio: string | null;
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

export type FranjaDisponible = {
  idFranja: number;
  servicioId: number;
  nombreServicio: string;
  proveedorId: number;
  nombreProveedor: string;
  fecha: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  precio: number;
  moneda: string;
};
export type ReservaResumen = {
  idReserva: number;
  codigoReserva: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreServicio: string;
  nombreNegocio: string;
  estado: string;
};
export type ReservaDetalle = ReservaResumen & {
  mensaje?: string;
  nombreProveedor: string;
  nombreCliente: string;
  duracionMinutos: number;
  precio: number;
  moneda: string;
  notas?: string;
  fechaCreacion: string;
  fechaCancelacion?: string;
  motivoCancelacion?: string;
  resumen?: string;
};
export type MisReservas = {
  mensaje: string;
  proximas: ReservaResumen[];
  historial: ReservaResumen[];
};
export type Agenda = {
  fecha: string;
  totalReservas: number;
  mensaje: string;
  reservas: {
    idReserva: number;
    codigoReserva: string;
    horaInicio: string;
    horaFin: string;
    nombreServicio: string;
    nombreNegocio: string;
    nombreCliente: string;
    telefonoCliente: string;
    notas: string;
  }[];
};
export type FranjaDefinida = {
  idFranja: number;
  servicioId: number;
  nombreServicio: string;
  duracionMinutos: number;
  proveedorId: number;
  nombreProveedor: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  nombreCreadaPor: string;
  fechaCreacion: string;
  mensaje?: string;
};
export type RecursoRequerido = {
  idRecurso: number;
  nombreRecurso: string;
  cantidadRequerida: number;
};

export const api = {
  franjasDisponibles: (servicioId: number, fecha: string, token: string) =>
    solicitudApi<FranjaDisponible[]>(
      "BUSINESS",
      `/api/v1/servicios/${servicioId}/franjas-disponibles?fecha=${encodeURIComponent(fecha)}`,
      {},
      token,
    ),
  reservar: (
    payload: {
      franjaId: number;
      servicioId: number;
      proveedorId: number;
      fecha: string;
      horaInicio: string;
      notas: string;
    },
    token: string,
  ) =>
    solicitudApi<ReservaDetalle>(
      "BUSINESS",
      "/api/v1/reservas",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  misReservas: (token: string) =>
    solicitudApi<MisReservas>(
      "BUSINESS",
      "/api/v1/reservas/mis-reservas",
      {},
      token,
    ),
  detalleReserva: (id: number, token: string) =>
    solicitudApi<ReservaDetalle>(
      "BUSINESS",
      `/api/v1/reservas/mis-reservas/${id}`,
      {},
      token,
    ),
  cancelarReserva: (id: number, motivo: string, token: string) =>
    solicitudApi<ReservaDetalle>(
      "BUSINESS",
      `/api/v1/reservas/${id}/cancelar`,
      { method: "POST", body: JSON.stringify({ motivo, confirmacion: true }) },
      token,
    ),
  miAgenda: (fecha: string, token: string) =>
    solicitudApi<Agenda>(
      "BUSINESS",
      `/api/v1/reservas/mi-agenda?fecha=${encodeURIComponent(fecha)}`,
      {},
      token,
    ),
  consultarFranjas: (servicioId: number, token: string, proveedorId?: number) =>
    solicitudApi<FranjaDefinida[]>(
      "MASTERS",
      `/api/v1/servicios/${servicioId}/franjas${proveedorId ? `?proveedorId=${proveedorId}` : ""}`,
      {},
      token,
    ),
  crearFranja: (
    payload: {
      servicioId: number;
      proveedorId?: number;
      diaSemana: string;
      horaInicio: string;
    },
    token: string,
  ) =>
    solicitudApi<FranjaDefinida>(
      "MASTERS",
      "/api/v1/franjas",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  eliminarFranja: (servicioId: number, franjaId: number, token: string) =>
    solicitudApi<void>(
      "MASTERS",
      `/api/v1/servicios/${servicioId}/franjas/${franjaId}`,
      { method: "DELETE" },
      token,
    ),
  recursosDeServicio: (servicioId: number, token: string) =>
    solicitudApi<RecursoRequerido[]>(
      "BUSINESS",
      `/api/v1/servicios/${servicioId}/recursos`,
      {},
      token,
    ),
  asociarRecurso: (
    servicioId: number,
    recursoId: number,
    cantidadRequerida: number,
    token: string,
  ) =>
    solicitudApi<unknown>(
      "BUSINESS",
      `/api/v1/servicios/${servicioId}/recursos`,
      {
        method: "POST",
        body: JSON.stringify({ recursoId, cantidadRequerida }),
      },
      token,
    ),
  quitarRecurso: (servicioId: number, recursoId: number, token: string) =>
    solicitudApi<void>(
      "BUSINESS",
      `/api/v1/servicios/${servicioId}/recursos/${recursoId}`,
      { method: "DELETE" },
      token,
    ),

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

  // MASTERS - Catálogo de negocios activos para el cliente
  negociosDisponibles: (token: string) =>
    solicitudApi<Negocio[]>(
      "MASTERS",
      "/api/v1/negocios/disponibles",
      {},
      token,
    ),

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

  // BUSINESS - Consultar proveedores ya vinculados a un servicio
  proveedoresAsignados: (servicioId: number, token: string) =>
    solicitudApi<ProveedorAsignado[]>(
      "BUSINESS",
      `/api/v1/servicios/${servicioId}/proveedores`,
      {},
      token,
    ),

  // BUSINESS - Consultar servicios del proveedor autenticado
  misServiciosAsignados: (token: string) =>
    solicitudApi<ServicioAsignado[]>(
      "BUSINESS",
      "/api/v1/proveedores/mis-servicios",
      {},
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
