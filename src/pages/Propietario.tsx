
import { Store, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

export default function Propietario() {
  return (
    <section className="fondo-app min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <Store
            size={44}
            className="titulo-app mx-auto mb-5"
          />

          <h1 className="titulo-app text-4xl font-bold">
            Panel del propietario
          </h1>

          <p className="texto-secundario mt-3">
            Administra tus negocios y los servicios
            que ofrecen.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/negocios"
            className="superficie-app rounded-2xl p-7 shadow-sm"
          >
            <Store
              size={30}
              className="titulo-app mb-5"
            />

            <h2 className="text-2xl font-semibold">
              Mis negocios
            </h2>

            <p className="texto-secundario mt-3">
              Registra y consulta tus negocios.
            </p>

            <span className="titulo-app mt-6 inline-block font-semibold">
              Acceder →
            </span>
          </Link>

          <Link
            to="/servicios"
            className="superficie-app rounded-2xl p-7 shadow-sm"
          >
            <BriefcaseBusiness
              size={30}
              className="titulo-app mb-5"
            />

            <h2 className="text-2xl font-semibold">
              Servicios
            </h2>

            <p className="texto-secundario mt-3">
              Gestiona los servicios de tus negocios.
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
