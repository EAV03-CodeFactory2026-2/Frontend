
import { UserRound, Info } from "lucide-react";

export default function PerfilCliente() {
  return (
    <section className="fondo-app min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="superficie-app rounded-2xl p-8 shadow-sm">
          <UserRound
            size={40}
            className="titulo-app mb-5"
          />

          <h1 className="titulo-app text-3xl font-bold">
            Mi perfil
          </h1>

          <p className="texto-secundario mt-3">
            Aquí podrás consultar la información
            asociada a tu cuenta de ReservaFlow.
          </p>

          <div className="mt-8 flex items-start gap-3 rounded-xl border p-4">
            <Info
              size={20}
              className="titulo-app shrink-0"
            />

            <p className="texto-secundario text-sm">
              La consulta de datos del perfil estará
              disponible cuando se integre el servicio
              correspondiente del backend.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
