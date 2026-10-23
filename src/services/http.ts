/**
 * Cliente HTTP compartido por WebAuth, Masters y Business.
 */

export type RolApi = "Cliente" | "Propietario" | "Proveedor";

export class ApiError extends Error {
  status: number;
  rolesDisponibles: RolApi[];

  constructor(
    status: number,
    message: string,
    rolesDisponibles: RolApi[] = [],
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.rolesDisponibles = rolesDisponibles;
  }
}

type ServicioApi = "AUTH" | "MASTERS" | "BUSINESS";

const variables: Record<ServicioApi, string | undefined> = {
  AUTH: import.meta.env.VITE_AUTH_URL,
  MASTERS: import.meta.env.VITE_MASTERS_URL,
  BUSINESS: import.meta.env.VITE_BUSINESS_URL,
};

const locales: Record<ServicioApi, string> = {
  AUTH: "http://localhost:8081",
  MASTERS: "http://localhost:8082",
  BUSINESS: "http://localhost:8083",
};

export function urlApi(servicio: ServicioApi): string {
  const configurada = variables[servicio]?.trim().replace(/\/+$/, "");

  if (configurada) {
    return configurada;
  }

  if (import.meta.env.DEV) {
    return locales[servicio];
  }

  throw new ApiError(
    0,
    `Falta configurar VITE_${servicio}_URL en el entorno de despliegue.`,
  );
}

function mensajeError(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    for (const campo of ["error", "mensaje", "message", "detail", "title"]) {
      if (typeof obj[campo] === "string" && obj[campo].trim()) {
        return obj[campo];
      }
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data.slice(0, 240);
  }

  if (status === 401) {
    return "No fue posible autenticar la solicitud. Verifica tus credenciales o inicia sesión nuevamente.";
  }

  if (status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (status === 404) {
    return "El recurso solicitado no está disponible.";
  }

  if (status >= 500) {
    return "El servidor presentó un error. Intenta de nuevo más tarde.";
  }

  return `Error HTTP ${status}`;
}

export async function solicitudApi<T>(
  servicio: ServicioApi,
  ruta: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const base = urlApi(servicio);

  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  if (init.body != null && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${base}${ruta}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      `No fue posible conectar con ${servicio}. Comprueba la URL, HTTPS, disponibilidad y configuración CORS.`,
    );
  }

  const contenido = await respuesta.text();

  let datos: unknown = null;

  if (contenido) {
    try {
      datos = JSON.parse(contenido);
    } catch {
      datos = contenido;
    }
  }

  if (!respuesta.ok) {
    const obj =
      datos && typeof datos === "object"
        ? (datos as Record<string, unknown>)
        : {};

    const disponibles = Array.isArray(obj.rolesDisponibles)
      ? obj.rolesDisponibles.filter(
          (r): r is RolApi =>
            r === "Cliente" || r === "Propietario" || r === "Proveedor",
        )
      : [];

    throw new ApiError(
      respuesta.status,
      mensajeError(datos, respuesta.status),
      disponibles,
    );
  }

  return datos as T;
}
