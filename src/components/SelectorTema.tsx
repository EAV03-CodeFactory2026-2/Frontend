import { Eye, Moon, Sun } from "lucide-react";

export type Tema = "claro" | "oscuro" | "confort";

type Props = { tema: Tema; cambiarTema: (tema: Tema) => void };
const temas = [
  { valor: "claro", nombre: "Claro", Icono: Sun },
  { valor: "oscuro", nombre: "Oscuro", Icono: Moon },
  { valor: "confort", nombre: "Confort", Icono: Eye },
] as const;

export default function SelectorTema({ tema, cambiarTema }: Props) {
  return (
    <section
      aria-label="Apariencia"
      className="mt-8 border-t lateral-divisor pt-5"
    >
      <p className="mb-3 text-sm">Apariencia</p>
      <div className="grid grid-cols-3 gap-2">
        {temas.map(({ valor, nombre, Icono }) => (
          <button
            type="button"
            key={valor}
            onClick={() => cambiarTema(valor)}
            aria-pressed={tema === valor}
            aria-label={`Activar modo ${nombre}`}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${tema === valor ? "lateral-opcion-activa" : "lateral-opcion"}`}
          >
            <Icono size={18} />
            {nombre}
          </button>
        ))}
      </div>
    </section>
  );
}

