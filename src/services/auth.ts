import { solicitudApi } from "./http";
export { ApiError } from "./http";

export type Rol = "Cliente" | "Propietario" | "Proveedor";

export type RegistroPayload = {
  rol: Rol;
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  especialidad?: string;
  descripcionProfesional?: string;
};

export type RegistroRespuesta = {
  token: string;
  tipoToken: string;
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rolActivo: Rol;
};

export type LoginRespuesta = {
  token: string;
  mensaje?: string;
  rolActivo: Rol;
  roles: Rol[];
};

export type TipoDocumento = {
  codigo: string;
  nombre?: string;
  descripcion?: string;
};

export type ValidacionTokenRespuesta = {
  valid: boolean;
  userId?: number | null;
  email?: string | null;
  roles?: Rol[] | null;
  rolActivo?: Rol | null;
};

export type CambioRolRespuesta = LoginRespuesta;

export const authApi = {
  registro: (payload: RegistroPayload) =>
    solicitudApi<RegistroRespuesta>("MASTERS", "/api/v1/usuarios/registro", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (correo: string, contrasena: string, rol?: Rol) =>
    solicitudApi<LoginRespuesta>("AUTH", "/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        correo,
        contrasena,
        ...(rol ? { rol } : {}),
      }),
    }),

  tiposDocumento: () =>
    solicitudApi<TipoDocumento[]>("MASTERS", "/api/v1/tipos-documento"),

  cambiarRol: (rol: Rol, token: string) =>
    solicitudApi<CambioRolRespuesta>(
      "AUTH",
      "/api/v1/auth/cambiar-rol",
      {
        method: "POST",
        body: JSON.stringify({ rol }),
      },
      token,
    ),

  validarToken: (token: string) =>
    solicitudApi<ValidacionTokenRespuesta>(
      "AUTH",
      "/api/v1/auth/validate",
      {},
      token,
    ),
};

// Sesión temporal por pestaña.
// El token real debe provenir de WebAuth.

export function guardarSesion(token: string, rol: Rol) {
  sessionStorage.setItem("reservaflow-token", token);
  sessionStorage.setItem("reservaflow-rol", rol);

  window.dispatchEvent(new Event("reservaflow-sesion-cambiada"));
}

export function obtenerSesion() {
  const token = sessionStorage.getItem("reservaflow-token");
  const rolGuardado = sessionStorage.getItem("reservaflow-rol");

  const rolesValidos: Rol[] = ["Cliente", "Propietario", "Proveedor"];

  const rol = rolesValidos.find((r) => r === rolGuardado);

  if (!token || !rol) return null;

  return { token, rol };
}


export function cerrarSesion() {
  sessionStorage.removeItem("reservaflow-token");
  sessionStorage.removeItem("reservaflow-rol");

  window.dispatchEvent(new Event("reservaflow-sesion-cambiada"));
}

export function rutaPorRol(rol: Rol): string {
  switch (rol) {
    case "Cliente":
      return "/cliente";
    case "Propietario":
      return "/propietario";
    case "Proveedor":
      return "/proveedor";
  }
}
