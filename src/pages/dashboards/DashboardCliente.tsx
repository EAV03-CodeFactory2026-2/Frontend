
import {
  Search,
  CalendarDays,
  UserRound,
} from "lucide-react";

import PanelRol from "../../components/PanelRol";

export default function DashboardCliente() {
  return (
    <PanelRol
      titulo="Panel del cliente"
      descripcion="Bienvenido a ReservaFlow. Explora los servicios disponibles y gestiona tu experiencia como cliente."
      accesos={[
        {
          titulo: "Explorar servicios",
          descripcion:
            "Conoce los negocios, servicios, precios y duración de cada atención.",
          ruta: "/cliente/servicios",
          icono: Search,
        },
        {
          titulo: "Mi perfil",
          descripcion:
            "Consulta la información asociada a tu cuenta.",
          ruta: "/cliente/perfil",
          icono: UserRound,
        },
        {
          titulo: "Mis reservas",
          descripcion:
            "Próximamente podrás consultar tus reservas y su estado.",
          ruta: "/reservas",
          icono: CalendarDays,
        },
      ]}
    />
  );
}
