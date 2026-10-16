import { CalendarDays, Clock3, Info } from "lucide-react";
export default function Reservas() {
  return (
    <div className="fondo-app min-h-screen px-5 py-12 md:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <CalendarDays className="titulo-app mx-auto mb-4" size={42} />
          <h1 className="titulo-app text-3xl font-bold">Gestión de Reservas</h1>
          <p className="texto-secundario mt-3">
            Próximamente podrás gestionar las reservas desde aquí.
          </p>
        </header>
        <section className="superficie-app rounded-2xl p-8 text-center shadow-sm">
          <Clock3 className="titulo-app mx-auto mb-4" size={36} />
          <h2 className="text-xl font-semibold">Funcionalidad en desarrollo</h2>
          <p className="texto-secundario mx-auto mt-3 max-w-lg">
            Esta sección se habilitará cuando el backend disponga de endpoints
            de reservas validados. Por ahora no permite crear ni consultar
            reservas reales.
          </p>
          <div className="mt-6 flex items-start justify-center gap-2 text-sm texto-secundario">
            <Info size={18} className="shrink-0" />
            <span>
              La navegación ya está disponible para la demostración visual.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
