import type { PuntoCobertura } from "@/types/cobertura";

/**
 * DATOS DE PRUEBA — NO SON INFRAESTRUCTURA REAL.
 * Coordenadas ficticias cerca del ejemplo 19.2220, -70.5290,
 * solo para probar el sistema. Se reemplazarán por las terminales
 * registradas en la base de datos del sistema ISP.
 */
export const PUNTOS_DE_PRUEBA: PuntoCobertura[] = [
  {
    id: "PRUEBA-01",
    nombre: "[PRUEBA] Punto de demostración 1",
    latitud: 19.222,
    longitud: -70.529,
    radioMetros: 300,
    activo: true,
    fechaCreacion: "2026-10-27T00:00:00Z",
    origen: "prueba",
  },
  {
    id: "PRUEBA-02",
    nombre: "[PRUEBA] Punto de demostración 2",
    latitud: 19.225,
    longitud: -70.525,
    radioMetros: 250,
    activo: true,
    fechaCreacion: "2026-10-27T00:00:00Z",
    origen: "prueba",
  },
  {
    id: "PRUEBA-03",
    nombre: "[PRUEBA] Punto de demostración 3",
    latitud: 19.218,
    longitud: -70.534,
    radioMetros: 200,
    activo: true,
    fechaCreacion: "2026-10-27T00:00:00Z",
    origen: "prueba",
  },
  {
    // Inactivo a propósito: sirve para comprobar que el algoritmo lo ignora.
    id: "PRUEBA-04",
    nombre: "[PRUEBA] Punto de demostración 4 (inactivo)",
    latitud: 19.23,
    longitud: -70.52,
    radioMetros: 300,
    activo: false,
    fechaCreacion: "2026-10-27T00:00:00Z",
    origen: "prueba",
  },
];
