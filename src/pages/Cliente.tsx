
import { Search, CalendarDays, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cliente() {
  return (
    <section className="fondo-app min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <LayoutDashboard
            size={44}
            className="titulo-app mx-auto mb-5"
          />

          <h1 className="titulo-app text-4xl font-bold">
            Bienvenido a ReservaFlow
          </h1>

          <p className="texto-secundario mt-3">
            Encuentra servicios y administra tus reservas.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/servicios"
            className="superficie-app rounded-2xl p-7 shadow-sm"
          >
            <Search size={30} className="titulo-app mb-5" />

            <h2 className="text-2xl font-semibold">
              Explorar servicios
            </h2>

            <p className="texto-secundario mt-3">
              Conoce los servicios disponibles.
            </p>

            <span className="titulo-app mt-6 inline-block font-semibold">
              Acceder →
            </span>
          </Link>

          <Link
            to="/reservas"
            className="superficie-app rounded-2xl p-7 shadow-sm"
          >
            <CalendarDays
              size={30}
              className="titulo-app mb-5"
            />

            <h2 className="text-2xl font-semibold">
              Mis reservas
            </h2>

            <p className="texto-secundario mt-3">
              Consulta tus reservas.
            </p>

            <span className="titulo-app mt-6 inline-block font-semibold">
              Acceder →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
