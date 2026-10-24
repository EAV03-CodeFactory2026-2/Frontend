import { Search, Store, Info } from "lucide-react";

export default function ExplorarServiciosCliente() {
  return (
    <section className="fondo-app min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="titulo-app text-3xl font-bold">Explorar servicios</h1>

          <p className="texto-secundario mt-2">
            Descubre negocios y consulta sus servicios.
          </p>
        </header>

        {/* Buscador pendiente de integración */}
        <div className="superficie-app mb-6 rounded-2xl p-5 shadow-sm">
          <label htmlFor="buscar-servicios" className="mb-2 block font-medium">
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
              placeholder="La búsqueda estará disponible próximamente"
              className="campo-app w-full rounded-xl py-3 pl-11 pr-4 opacity-60 cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        {/* Información de integración */}
        <div className="mb-6 flex items-start gap-3">
          <Info size={20} className="texto-secundario mt-0.5 shrink-0" />

          <p className="texto-secundario text-sm">
            La consulta de negocios y servicios estará disponible cuando
            finalice su integración con Masters. Las reservas en línea se
            implementarán en una próxima etapa.
          </p>
        </div>

        {/* Estado sin servicios */}
        <div className="superficie-app rounded-2xl p-10 text-center">
          <div className="mb-4 flex justify-center">
            <Store size={48} className="texto-secundario opacity-60" />
          </div>

          <h2 className="titulo-app text-xl font-semibold">
            Catálogo pendiente de integración
          </h2>

          <p className="texto-secundario mx-auto mt-3 max-w-md">
            Próximamente podrás explorar los negocios registrados en ReservaFlow
            y consultar sus servicios, precios y duración.
          </p>
        </div>
      </div>
    </section>
  );
}
