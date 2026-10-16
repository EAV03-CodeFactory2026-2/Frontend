import { BriefcaseBusiness, CalendarDays, CalendarClock, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const accesos = [
  { titulo: "Mis servicios asignados", descripcion: "Consulta únicamente los negocios y servicios a los que estás vinculado.", ruta: "/proveedor/servicios", icono: BriefcaseBusiness },
  { titulo: "Mi horario", descripcion: "Configura tus días de atención y bloques horarios semanales.", ruta: "/proveedor/horario", icono: CalendarClock },
  { titulo: "Reservas", descripcion: "Consulta las reservas correspondientes.", ruta: "/reservas", icono: CalendarDays },
];

export default function Proveedor() {
  return (
    <section className="fondo-app min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <LayoutDashboard size={44} className="titulo-app mx-auto mb-5" />
          <h1 className="titulo-app text-4xl font-bold">Panel del proveedor</h1>
          <p className="texto-secundario mt-3">Consulta tus servicios asignados, configura tu horario y revisa tus reservas.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {accesos.map(({ titulo, descripcion, ruta, icono: Icono }) => (
            <Link key={ruta} to={ruta} className="superficie-app rounded-2xl p-7 shadow-sm transition hover:shadow-md">
              <Icono size={30} className="titulo-app mb-5" />
              <h2 className="text-2xl font-semibold">{titulo}</h2>
              <p className="texto-secundario mt-3">{descripcion}</p>
              <span className="titulo-app mt-6 inline-block font-semibold">Acceder →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
