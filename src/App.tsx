import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import RutaProtegida from "./components/RutaProtegida";

import type { Tema } from "./components/SelectorTema";

import { obtenerSesion, rutaPorRol } from "./services/auth";

import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

import Cliente from "./pages/dashboards/DashboardCliente";
import Propietario from "./pages/dashboards/DashboardPropietario";

// CORREGIDO: utilizar el panel actualizado del proveedor.
import Proveedor from "./pages/Proveedor";

import Negocios from "./pages/Negocios";
import Servicios from "./pages/Servicios";
import Reservas from "./pages/Reservas";
import Recursos from "./pages/Recursos";
import AsignacionProveedores from "./pages/AsignacionProveedores";
import HorarioProveedor from "./pages/HorarioProveedor";
import MisServiciosProveedor from "./pages/MisServiciosProveedor";
import ExplorarServiciosCliente from "./pages/ExplorarServiciosCliente";
import PerfilCliente from "./pages/PerfilCliente";

function InicioPublico() {
  const sesion = obtenerSesion();

  if (sesion) {
    return <Navigate to={rutaPorRol(sesion.rol)} replace />;
  }

  return <Inicio />;
}

function AccesoPublico({ children }: { children: React.ReactNode }) {
  const sesion = obtenerSesion();

  if (sesion) {
    return <Navigate to={rutaPorRol(sesion.rol)} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [tema, cambiarTema] = useState<Tema>(() => {
    const guardado = localStorage.getItem("tema-reservaflow");

    return guardado === "oscuro" || guardado === "confort" ? guardado : "claro";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);

    localStorage.setItem("tema-reservaflow", tema);
  }, [tema]);

  return (
    <BrowserRouter>
      <div className="fondo-app min-h-screen md:flex">
        <Sidebar tema={tema} cambiarTema={cambiarTema} />

        <main className="min-w-0 flex-1">
          <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/" element={<InicioPublico />} />

            <Route
              path="/login"
              element={
                <AccesoPublico>
                  <Login />
                </AccesoPublico>
              }
            />

            <Route
              path="/registro"
              element={
                <AccesoPublico>
                  <Registro />
                </AccesoPublico>
              }
            />
            
            {/* CLIENTE */}
            <Route element={<RutaProtegida rolesPermitidos={["Cliente"]} />}>
              <Route path="/cliente" element={<Cliente />} />

              <Route
                path="/cliente/servicios"
                element={<ExplorarServiciosCliente />}
              />

              <Route path="/cliente/perfil" element={<PerfilCliente />} />
            </Route>

            {/* PROPIETARIO */}
            <Route
              element={<RutaProtegida rolesPermitidos={["Propietario"]} />}
            >
              <Route path="/propietario" element={<Propietario />} />

              <Route path="/negocios" element={<Negocios />} />

              <Route path="/recursos" element={<Recursos />} />

              <Route
                path="/asignacion-proveedores"
                element={<AsignacionProveedores />}
              />

              {/* Gestión administrativa de servicios */}
              <Route path="/servicios" element={<Servicios />} />
            </Route>

            {/* PROVEEDOR */}
            <Route element={<RutaProtegida rolesPermitidos={["Proveedor"]} />}>
              <Route path="/proveedor" element={<Proveedor />} />

              <Route path="/proveedor/horario" element={<HorarioProveedor />} />

              <Route
                path="/proveedor/servicios"
                element={<MisServiciosProveedor />}
              />
            </Route>

            {/* RESERVAS: CLIENTE Y PROVEEDOR */}
            <Route
              element={
                <RutaProtegida rolesPermitidos={["Cliente", "Proveedor"]} />
              }
            >
              <Route path="/reservas" element={<Reservas />} />
            </Route>

            {/* PÁGINA NO ENCONTRADA */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
