import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Store,
  BriefcaseBusiness,
  CalendarDays,
  CalendarClock,
  LogIn,
  UserRoundPlus,
  UserRound,
  LogOut,
  Search,
  Boxes,
  UsersRound,
} from "lucide-react";

import SelectorTema, { type Tema } from "./SelectorTema";

import {
  authApi,
  obtenerSesion,
  guardarSesion,
  cerrarSesion,
  rutaPorRol,
  type Rol,
} from "../services/auth";

type Props = {
  tema: Tema;
  cambiarTema: (tema: Tema) => void;
};

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === "true";

const EVENTO_SESION = "reservaflow-sesion-cambiada";
const EVENTO_ROLES = "reservaflow-roles-actualizados";

const menus = {
  Cliente: [
    {
      nombre: "Mi panel",
      ruta: "/cliente",
      icono: LayoutDashboard,
    },
    {
      nombre: "Explorar servicios",
      ruta: "/cliente/servicios",
      icono: Search,
    },
    {
      nombre: "Mis reservas",
      ruta: "/reservas",
      icono: CalendarDays,
    },
  ],

  Propietario: [
    {
      nombre: "Mi panel",
      ruta: "/propietario",
      icono: LayoutDashboard,
    },
    {
      nombre: "Mis negocios",
      ruta: "/negocios",
      icono: Store,
    },
    {
      nombre: "Servicios",
      ruta: "/servicios",
      icono: BriefcaseBusiness,
    },
    {
      nombre: "Recursos",
      ruta: "/recursos",
      icono: Boxes,
    },
    {
      nombre: "Asignar proveedores",
      ruta: "/asignacion-proveedores",
      icono: UsersRound,
    },
  ],

  Proveedor: [
    {
      nombre: "Mi panel",
      ruta: "/proveedor",
      icono: LayoutDashboard,
    },
    {
      nombre: "Mis servicios asignados",
      ruta: "/proveedor/servicios",
      icono: BriefcaseBusiness,
    },
    {
      nombre: "Mi horario",
      ruta: "/proveedor/horario",
      icono: CalendarClock,
    },
    {
      nombre: "Reservas",
      ruta: "/reservas",
      icono: CalendarDays,
    },
  ],
};

const menuPublico = [
  {
    nombre: "Inicio",
    ruta: "/",
    icono: LayoutDashboard,
  },
  {
    nombre: "Iniciar sesión",
    ruta: "/login",
    icono: LogIn,
  },
  {
    nombre: "Registrarse",
    ruta: "/registro",
    icono: UserRoundPlus,
  },
];

const rolesValidos: Rol[] = ["Cliente", "Propietario", "Proveedor"];

function esRol(valor: string): valor is Rol {
  return rolesValidos.includes(valor as Rol);
}

export default function Sidebar({ tema, cambiarTema }: Props) {
  const navigate = useNavigate();

  // Actualizar el menú cuando cambia la sesión.
  const [, actualizarSesion] = useState(0);

  useEffect(() => {
    const actualizar = () => {
      actualizarSesion((valor) => valor + 1);
    };

    window.addEventListener(EVENTO_SESION, actualizar);

    return () => {
      window.removeEventListener(EVENTO_SESION, actualizar);
    };
  }, []);

  const sesion = obtenerSesion();

  const token = sesion?.token;
  const rolActivo = sesion?.rol;

  const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]);
  const [cambiandoRol, setCambiandoRol] = useState(false);
  const [errorRol, setErrorRol] = useState("");

  // Permite volver a consultar WebAuth cuando Masters agrega un rol.
  const [versionRoles, setVersionRoles] = useState(0);

  useEffect(() => {
    const actualizarRoles = () => {
      setVersionRoles((valor) => valor + 1);
    };

    window.addEventListener(EVENTO_ROLES, actualizarRoles);

    return () => {
      window.removeEventListener(EVENTO_ROLES, actualizarRoles);
    };
  }, []);

  // Consultar los roles autorizados desde WebAuth.
  useEffect(() => {
    let cancelado = false;

    setRolesDisponibles([]);
    setErrorRol("");

    // No enviar tokens simulados a WebAuth.
    if (!token || token === "token-demo" || MODO_DEMO) {
      return;
    }

    async function consultarRoles() {
      if (!token) return;

      try {
        const respuesta = await authApi.validarToken(token);

        if (cancelado) return;

        if (!respuesta.valid) {
          setRolesDisponibles([]);
          return;
        }

        const roles = (respuesta.roles ?? []).filter(esRol);

        setRolesDisponibles(roles);
      } catch {
        if (!cancelado) {
          setRolesDisponibles([]);
        }
      }
    }

    void consultarRoles();

    return () => {
      cancelado = true;
    };
  }, [token, versionRoles]);

  // Cambiar el rol activo sin cerrar sesión.
  async function cambiarRol(nuevoRol: Rol) {
    const actual = obtenerSesion();

    if (!actual || nuevoRol === actual.rol || cambiandoRol) {
      return;
    }

    if (MODO_DEMO || actual.token === "token-demo") {
      setErrorRol("El cambio de rol real requiere iniciar sesión con WebAuth.");
      return;
    }

    setCambiandoRol(true);
    setErrorRol("");

    try {
      const respuesta = await authApi.cambiarRol(nuevoRol, actual.token);

      if (!respuesta.token || respuesta.rolActivo !== nuevoRol) {
        throw new Error(
          "WebAuth no devolvió un token válido para el rol seleccionado.",
        );
      }

      // Guardar el token correspondiente al nuevo rol.
      guardarSesion(respuesta.token, respuesta.rolActivo);

      setRolesDisponibles((respuesta.roles ?? []).filter(esRol));

      // Abrir el panel correspondiente.
      navigate(rutaPorRol(nuevoRol), {
        replace: true,
      });
    } catch (error) {
      setErrorRol(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar el rol.",
      );
    } finally {
      setCambiandoRol(false);
    }
  }

  // Cerrar sesión.
  function salir() {
    cerrarSesion();

    setRolesDisponibles([]);
    setErrorRol("");

    navigate("/login", {
      replace: true,
    });
  }

  const opciones = rolActivo ? menus[rolActivo] : menuPublico;

  return (
    <aside className="lateral-app w-full p-6 md:min-h-screen md:w-64 md:shrink-0">
      <h1 className="titulo-app text-2xl font-bold">ReservaFlow</h1>

      <p className="mt-3 text-sm opacity-75">Plataforma de reservas</p>

      {/* INFORMACIÓN DE LA SESIÓN */}
      {sesion && (
        <div className="mt-6 rounded-lg border lateral-divisor p-3">
          <p className="text-xs opacity-75">Sesión activa</p>

          <p className="mt-1 font-semibold">{rolActivo}</p>

          {/* SELECTOR DE ROLES REALES */}
          {rolesDisponibles.length > 1 && rolActivo && (
            <div className="mt-4">
              <label
                htmlFor="selector-rol-activo"
                className="mb-2 block text-sm font-medium"
              >
                Cambiar rol
              </label>

              <select
                id="selector-rol-activo"
                className="campo-app w-full"
                value={rolActivo}
                disabled={cambiandoRol}
                onChange={(e) => {
                  const rol = e.target.value;

                  if (esRol(rol)) {
                    void cambiarRol(rol);
                  }
                }}
              >
                {rolesDisponibles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>

              {cambiandoRol && (
                <p className="mt-2 text-xs opacity-75">Cambiando rol...</p>
              )}
            </div>
          )}

          {errorRol && (
            <p role="alert" className="mt-3 text-sm text-red-500">
              {errorRol}
            </p>
          )}
        </div>
      )}

      {/* MENÚ DE NAVEGACIÓN */}
      <nav aria-label="Navegación principal" className="mt-8 space-y-2">
        {opciones.map(({ nombre, ruta, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                isActive ? "lateral-link-activo" : "lateral-link"
              }`
            }
          >
            <Icono size={20} aria-hidden="true" />

            <span>{nombre}</span>
          </NavLink>
        ))}
      </nav>

      {/* MI CUENTA - TODOS LOS ROLES */}
      {sesion && (
        <NavLink
          to="/mi-cuenta"
          className={({ isActive }) =>
            `mt-3 flex items-center gap-3 rounded-lg px-4 py-3 transition ${
              isActive ? "lateral-link-activo" : "lateral-link"
            }`
          }
        >
          <UserRound size={20} aria-hidden="true" />

          <span>Mi cuenta</span>
        </NavLink>
      )}

      {/* CERRAR SESIÓN */}
      {sesion && (
        <button
          type="button"
          onClick={salir}
          className="lateral-link mt-5 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      )}

      {/* SELECTOR DE TEMA */}
      <div className="mt-8 border-t lateral-divisor pt-5">
        <SelectorTema tema={tema} cambiarTema={cambiarTema} />
      </div>

      <p className="mt-7 border-t lateral-divisor pt-5 text-sm opacity-75">
        Plataforma de gestión de reservas
      </p>
    </aside>
  );
}
