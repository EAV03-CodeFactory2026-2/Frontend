import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import {
  authApi,
  obtenerSesion,
  cerrarSesion,
  rutaPorRol,
  type Rol,
} from "../services/auth";

type Props = {
  rolesPermitidos: Rol[];
};

type EstadoSesion = "verificando" | "valida" | "invalida" | "sin-conexion";

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";

export default function RutaProtegida({ rolesPermitidos }: Props) {
  const sesion = obtenerSesion();

  const token = sesion?.token;
  const rolActivo = sesion?.rol;

  const [estado, setEstado] = useState<EstadoSesion>("verificando");

  useEffect(() => {
    let cancelado = false;

    async function verificarSesion() {
      // No existe una sesión guardada.
      if (!token || !rolActivo) {
        setEstado("invalida");
        return;
      }

      // Permitir pruebas locales con token-demo.
      if (MODO_DEMO && token === "token-demo") {
        setEstado("valida");
        return;
      }

      setEstado("verificando");

      try {
        const respuesta = await authApi.validarToken(token);

        if (cancelado) return;

        if (!respuesta.valid) {
          cerrarSesion();
          setEstado("invalida");
          return;
        }

        // Verificar que el rol del token coincida
        // con el rol guardado en la sesión.
        if (respuesta.rolActivo !== rolActivo) {
          cerrarSesion();
          setEstado("invalida");
          return;
        }

        setEstado("valida");
      } catch {
        if (!cancelado) {
          // Un error de conexión no significa que
          // el token sea inválido.
          setEstado("sin-conexion");
        }
      }
    }

    void verificarSesion();

    return () => {
      cancelado = true;
    };
  }, [token, rolActivo]);

  // Mientras se consulta WebAuth.
  if (estado === "verificando") {
    return (
      <div role="status" className="p-8 text-center">
        Verificando tu sesión...
      </div>
    );
  }

  // Sesión inexistente o inválida.
  if (!sesion || estado === "invalida") {
    return <Navigate to="/login" replace />;
  }

  // No se pudo verificar por problemas de conexión.
  if (estado === "sin-conexion") {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h2 className="titulo-app text-xl font-bold">
          No fue posible verificar tu sesión
        </h2>

        <p className="texto-secundario mt-3">
          No se pudo establecer comunicación con WebAuth. Comprueba tu conexión
          o la disponibilidad del servidor.
        </p>

        <button
          type="button"
          className="boton-app mt-5"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Verificar permisos del rol.
  if (!rolesPermitidos.includes(sesion.rol)) {
    return <Navigate to={rutaPorRol(sesion.rol)} replace />;
  }

  return <Outlet />;
}
