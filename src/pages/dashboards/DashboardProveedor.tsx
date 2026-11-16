import { BriefcaseBusiness, CalendarDays } from "lucide-react";
import PanelRol from "../../components/PanelRol";

export default function DashboardProveedor() {
  return (
    <PanelRol
      titulo="Panel del proveedor"
      descripcion="Consulta tus servicios y las reservas relacionadas."
      accesos={[
        {
          titulo: "Mis servicios",
          descripcion: "Consulta los servicios asociados.",
          ruta: "/servicios",
          icono: BriefcaseBusiness,
        },
        {
          titulo: "Mi agenda",
          descripcion:
            "Revisa por fecha tus citas confirmadas y los datos de atención.",
          ruta: "/proveedor/agenda",
          icono: CalendarDays,
        },
      ]}
    />
  );
}
