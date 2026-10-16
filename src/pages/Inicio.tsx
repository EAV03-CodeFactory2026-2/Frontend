import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  BriefcaseBusiness,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
const tarjetas = [
  {
    titulo: "Negocios",
    texto: "Registra y consulta negocios.",
    ruta: "/negocios",
    Icono: Store,
  },
  {
    titulo: "Servicios",
    texto: "Prepara el catálogo de servicios.",
    ruta: "/servicios",
    Icono: BriefcaseBusiness,
  },
  {
    titulo: "Reservas",
    texto: "Módulo pendiente de implementación.",
    ruta: "/reservas",
    Icono: CalendarDays,
  },
];
export default function Inicio() {
  return (
    <div className="fondo-app min-h-screen px-5 py-12 md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 text-center">
          <LayoutDashboard className="titulo-app mx-auto mb-3" size={38} />
          <h1 className="titulo-app text-3xl font-bold">
            Panel de administración
          </h1>
          <p className="texto-secundario mt-3">
            Bienvenido a ReservaFlow. Explora las funcionalidades de tu
            plataforma.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {tarjetas.map(({ titulo, texto, ruta, Icono }) => (
            <Link
              to={ruta}
              key={ruta}
              className="superficie-app block rounded-2xl p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2"
            >
              <Icono className="titulo-app mb-4" size={28} />
              <h2 className="text-xl font-semibold">{titulo}</h2>
              <p className="texto-secundario my-3 text-sm">{texto}</p>
              <span className="titulo-app inline-flex items-center gap-2 text-sm font-semibold">
                Ver sección <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
        <div className="superficie-app mt-8 rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Estado del proyecto</h2>
          <p className="texto-secundario mt-2 text-sm">
            Interfaz en desarrollo. La autenticación, persistencia y conexión
            con las tres API se verificarán cuando las historias de usuario
            estén listas.
          </p>
        </div>
      </div>
    </div>
  );
}
