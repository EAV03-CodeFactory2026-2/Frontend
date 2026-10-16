
import {
  Search,
  Store,
  Clock3,
  Banknote,
  Info,
} from "lucide-react";

import { useMemo, useState } from "react";

type ServicioCliente = {
  id: number;
  negocio: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
};

const serviciosDemo: ServicioCliente[] = [
  {
    id: 1,
    negocio: "Barbería Central",
    nombre: "Corte de cabello",
    descripcion: "Servicio de corte de cabello.",
    duracion: 30,
    precio: 25000,
  },
  {
    id: 2,
    negocio: "Barbería Central",
    nombre: "Arreglo de barba",
    descripcion: "Servicio de arreglo y perfilado de barba.",
    duracion: 20,
    precio: 15000,
  },
];

const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function ExplorarServiciosCliente() {
  const [busqueda, setBusqueda] = useState("");

  const serviciosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return serviciosDemo.filter((servicio) =>
      `${servicio.negocio} ${servicio.nombre} ${servicio.descripcion}`
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda]);

  return (
    <section className="fondo-app min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="titulo-app text-3xl font-bold">
            Explorar servicios
          </h1>
          <p className="texto-secundario mt-2">
            Descubre negocios y consulta sus servicios.
          </p>
        </header>

        <div className="superficie-app mb-6 rounded-2xl p-5 shadow-sm">
          <label
            htmlFor="buscar-servicios"
            className="mb-2 block font-medium"
          >
            Buscar un servicio o negocio
          </label>

          <div className="relative">
            <Search
              size={20}
              className="texto-secundario absolute left-3 top-1/2 -translate-y-1/2"
            />

            <input
              id="buscar-servicios"
              type="search"
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Ej. Corte de cabello"
              className="campo-app w-full rounded-xl py-3 pl-11 pr-4"
            />
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2">
          <Info size={18} className="texto-secundario" />
          <p className="texto-secundario text-sm">
            Vista de demostración. Las reservas estarán
            disponibles en una próxima etapa.
          </p>
        </div>

        {serviciosFiltrados.length === 0 ? (
          <div className="superficie-app rounded-2xl p-8 text-center">
            <p className="texto-secundario">
              No encontramos servicios con esa búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {serviciosFiltrados.map((servicio) => (
              <article
                key={servicio.id}
                className="superficie-app rounded-2xl p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Store size={20} className="titulo-app" />
                  <span className="texto-secundario text-sm">
                    {servicio.negocio}
                  </span>
                </div>

                <h2 className="titulo-app text-xl font-semibold">
                  {servicio.nombre}
                </h2>

                <p className="texto-secundario mt-2">
                  {servicio.descripcion}
                </p>

                <div className="mt-5 flex flex-wrap gap-5">
                  <span className="flex items-center gap-2">
                    <Clock3 size={18} />
                    {servicio.duracion} minutos
                  </span>

                  <span className="flex items-center gap-2 font-semibold">
                    <Banknote size={18} />
                    {formatoPrecio.format(servicio.precio)}
                  </span>
                </div>

                <div className="mt-6 border-t pt-4">
                  <p className="texto-secundario text-sm">
                    Reserva en línea: próximamente.
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
