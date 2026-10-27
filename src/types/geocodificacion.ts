/** Una dirección encontrada por el servicio de geocodificación. */
export interface ResultadoDireccion {
  nombre: string;
  latitud: number;
  longitud: number;
}

/** Respuesta de nuestra ruta /api/geocodificar. */
export type RespuestaGeocodificacion =
  | { ok: true; resultados: ResultadoDireccion[] }
  | { ok: false; error: string };
