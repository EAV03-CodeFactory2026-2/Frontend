
import { Navigate, Outlet } from "react-router-dom";
import {
  obtenerSesion,
  rutaPorRol,
  type Rol,
} from "../services/auth";

type Props = {
  rolesPermitidos: Rol[];
};

export default function RutaProtegida({
  rolesPermitidos,
}: Props) {
  const sesion = obtenerSesion();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(sesion.rol)) {
    return (
      <Navigate
        to={rutaPorRol(sesion.rol)}
        replace
      />
    );
  }

  return <Outlet />;
}
