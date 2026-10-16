
import type {
  Negocio,
  Servicio,
  Modalidad,
} from "../services/api";

export const negociosDemo: Negocio[] = [
  {
    idNegocio: 1,
    nombreNegocio: "Barbería Central",
    direccionNegocio: "Calle 10 #20-30",
    telefono: "3001234567",
    identificacionFiscal: "900123456",
    monedaCodigoIso: "COP",
  },
  {
    idNegocio: 2,
    nombreNegocio: "Centro de Bienestar",
    direccionNegocio: "Carrera 15 #12-40",
    telefono: "3109876543",
    identificacionFiscal: "900987654",
    monedaCodigoIso: "COP",
  },
];

export const modalidadesDemo: Modalidad[] = [
  {
    idModalidad: 1,
    nombreModalidad: "Presencial",
  },
  {
    idModalidad: 2,
    nombreModalidad: "Virtual",
  },
];

export const serviciosDemo: Servicio[] = [
  {
    idServicio: 1,
    negocioId: 1,
    modalidadId: 1,
    nombre: "Corte de cabello",
    descripcion: "Corte clásico para caballero",
    duracionMinutos: 30,
    precio: 25000,
  },
  {
    idServicio: 2,
    negocioId: 1,
    modalidadId: 1,
    nombre: "Arreglo de barba",
    descripcion: "Perfilado y arreglo de barba",
    duracionMinutos: 20,
    precio: 15000,
  },
  {
    idServicio: 3,
    negocioId: 2,
    modalidadId: 2,
    nombre: "Asesoría de bienestar",
    descripcion: "Orientación personalizada en línea",
    duracionMinutos: 60,
    precio: 60000,
  },
];
