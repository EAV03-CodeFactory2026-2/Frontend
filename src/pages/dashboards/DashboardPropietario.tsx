
import {
  Store,
  BriefcaseBusiness,
  Boxes,
  UsersRound,
} from "lucide-react";

import PanelRol from "../../components/PanelRol";

export default function DashboardPropietario() {
  return (
    <PanelRol
      titulo="Panel del propietario"
      descripcion="Administra tus negocios, servicios, recursos y asignaciones de proveedores."
      accesos={[
        {
          titulo: "Mis negocios",
          descripcion: "Registra y consulta tus negocios.",
          ruta: "/negocios",
          icono: Store,
        },
        {
          titulo: "Servicios",
          descripcion: "Gestiona los servicios de tus negocios.",
          ruta: "/servicios",
          icono: BriefcaseBusiness,
        },
        {
          titulo: "Recursos",
          descripcion: "Registra y consulta los recursos de tus negocios.",
          ruta: "/recursos",
          icono: Boxes,
        },
        {
          titulo: "Asignar proveedores",
          descripcion:
            "Busca y asigna uno o varios proveedores a los servicios de tus negocios.",
          ruta: "/asignacion-proveedores",
          icono: UsersRound,
        },
      ]}
    />
  );
}
