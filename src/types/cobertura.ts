// Tipos compartidos del Sistema de Cobertura de Fibra Óptica.
// Todos los demás archivos usan estas definiciones.

/** Un par de coordenadas geográficas en grados decimales. */
export interface Coordenadas {
  latitud: number;  // de -90 a 90
  longitud: number; // de -180 a 180
}

/**
 * De dónde provienen los datos de un punto.
 * - "prueba": datos de demostración, NO son infraestructura real.
 * - "base_de_datos": cajas NAP reales leídas de MikroWISP.
 */
export type OrigenDatos = "prueba" | "base_de_datos";

/** Un punto donde la empresa tiene infraestructura de fibra (una caja NAP). */
export interface PuntoCobertura {
  id: string;                   // texto, para aceptar cualquier tipo de ID
  nombre: string;
  latitud: number;
  longitud: number;
  radioMetros: number;          // radio de la zona "segura" (cobertura probable)
  activo: boolean;
  fechaCreacion: string | null; // ISO; null si la fuente no la guarda (MikroWISP)
  origen: OrigenDatos;
  puertos?: number | null;      // puertos totales de la caja
  ubicacion?: string | null;    // referencia de dirección
}

/** Una terminal que se ignoró porque sus datos no son válidos. */
export interface PuntoDescartado {
  id: string;
  nombre: string;
  coordenadas: string;
  motivo: string;
}

/** Parámetros de la consulta, configurables con variables de entorno. */
export interface ConfiguracionConsulta {
  radioSeguroMetros: number;  // hasta aquí: cobertura probable (verde)
  radioMaximoMetros: number;  // hasta aquí: requiere verificación (amarillo); más allá: sin cobertura (rojo)
  cantidadCercanos: number;   // cuántas cajas cercanas mostrar en el mapa y el listado
}

/** Resultado de cargar los puntos de cobertura desde su origen. */
export interface CargaPuntos {
  origen: OrigenDatos;
  puntos: PuntoCobertura[];
  descartados: PuntoDescartado[];
  error: string | null; // mensaje para el usuario si no se pudieron cargar
  configuracion: ConfiguracionConsulta;
}

/** Los resultados posibles de una consulta. */
export type EstadoCobertura =
  | "COBERTURA_DISPONIBLE"
  | "REQUIERE_VERIFICACION"
  | "SIN_COBERTURA_REGISTRADA"
  | "ERROR_DE_CONSULTA";

/** Información del punto activo más cercano a la ubicación consultada. */
export interface PuntoCercano {
  punto: PuntoCobertura;
  distanciaMetros: number;
}

/** Resultado completo de una consulta de cobertura. */
export type ResultadoConsulta =
  | {
      estado: "COBERTURA_DISPONIBLE" | "REQUIERE_VERIFICACION" | "SIN_COBERTURA_REGISTRADA";
      ubicacion: Coordenadas;
      masCercano: PuntoCercano | null; // el punto que justifica el resultado
      cercanos: PuntoCercano[];        // las cajas más cercanas, de la más cercana a la más lejana
      radioMaximoMetros: number;
      usaDatosDePrueba: boolean;
    }
  | {
      estado: "ERROR_DE_CONSULTA";
      mensaje: string;
    };
