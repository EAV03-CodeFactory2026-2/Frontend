
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Acceso = {
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: LucideIcon;
};

type Props = {
  titulo: string;
  descripcion: string;
  accesos: Acceso[];
};

export default function PanelRol({
  titulo,
  descripcion,
  accesos,
}: Props) {
  return (
    <section className="fondo-app min-h-screen px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="superficie-app mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
            <LayoutDashboard
              size={30}
              className="titulo-app"
            />
          </div>

          <h1 className="titulo-app text-3xl font-bold md:text-4xl">
            {titulo}
          </h1>

          <p className="texto-secundario mt-3 text-lg">
            {descripcion}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accesos.map(
            ({ titulo, descripcion, ruta, icono: Icono }) => (
              <Link
                key={ruta}
                to={ruta}
                className="superficie-app group rounded-2xl p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--borde)]">
                  <Icono
                    size={24}
                    className="titulo-app"
                  />
                </div>

                <h2 className="mb-2 text-xl font-semibold">
                  {titulo}
                </h2>

                <p className="texto-secundario mb-6 text-sm">
                  {descripcion}
                </p>

                <span className="titulo-app flex items-center gap-2 font-semibold">
                  Acceder
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
