import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, BriefcaseBusiness, CalendarDays, CalendarClock, LogIn, UserRoundPlus, LogOut, Search, Boxes, UsersRound } from "lucide-react";
import SelectorTema, { type Tema } from "./SelectorTema";
import { obtenerSesion, cerrarSesion, type Rol } from "../services/auth";

type Props = { tema: Tema; cambiarTema: (tema: Tema) => void };

const menus = {
  Cliente: [
    { nombre: "Mi panel", ruta: "/cliente", icono: LayoutDashboard },
    { nombre: "Explorar servicios", ruta: "/cliente/servicios", icono: Search },
    { nombre: "Mis reservas", ruta: "/reservas", icono: CalendarDays },
  ],
  Propietario: [
    { nombre: "Mi panel", ruta: "/propietario", icono: LayoutDashboard },
    { nombre: "Mis negocios", ruta: "/negocios", icono: Store },
    { nombre: "Servicios", ruta: "/servicios", icono: BriefcaseBusiness },
    { nombre: "Recursos", ruta: "/recursos", icono: Boxes },
    { nombre: "Asignar proveedores", ruta: "/asignacion-proveedores", icono: UsersRound },
  ],
  Proveedor: [
    { nombre: "Mi panel", ruta: "/proveedor", icono: LayoutDashboard },
    { nombre: "Mis servicios asignados", ruta: "/proveedor/servicios", icono: BriefcaseBusiness },
    { nombre: "Mi horario", ruta: "/proveedor/horario", icono: CalendarClock },
    { nombre: "Reservas", ruta: "/reservas", icono: CalendarDays },
  ],
};

const menuPublico = [
  { nombre: "Inicio", ruta: "/", icono: LayoutDashboard },
  { nombre: "Iniciar sesión", ruta: "/login", icono: LogIn },
  { nombre: "Registrarse", ruta: "/registro", icono: UserRoundPlus },
];

export default function Sidebar({ tema, cambiarTema }: Props) {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const opciones = sesion ? menus[sesion.rol as Rol] ?? [] : menuPublico;

  function salir() {
    cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="lateral-app w-full p-6 md:min-h-screen md:w-64 md:shrink-0">
      <h1 className="titulo-app text-2xl font-bold">ReservaFlow</h1>
      <p className="mt-3 text-sm opacity-75">Plataforma de reservas</p>
      {sesion && (
        <div className="mt-6 rounded-lg border lateral-divisor p-3">
          <p className="text-xs opacity-75">Sesión activa</p>
          <p className="mt-1 font-semibold">{sesion.rol}</p>
        </div>
      )}
      <nav aria-label="Navegación principal" className="mt-8 space-y-2">
        {opciones.map(({ nombre, ruta, icono: Icono }) => (
          <NavLink key={ruta} to={ruta} end className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-3 transition ${isActive ? "lateral-link-activo" : "lateral-link"}`
          }>
            <Icono size={20} aria-hidden="true" />
            <span>{nombre}</span>
          </NavLink>
        ))}
      </nav>
      {sesion && (
        <button type="button" onClick={salir} className="lateral-link mt-5 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left">
          <LogOut size={20} /> Cerrar sesión
        </button>
      )}
      <div className="mt-8 border-t lateral-divisor pt-5">
        <SelectorTema tema={tema} cambiarTema={cambiarTema} />
      </div>
      <p className="mt-7 border-t lateral-divisor pt-5 text-sm opacity-75">Plataforma de gestión de reservas</p>
    </aside>
  );
}
