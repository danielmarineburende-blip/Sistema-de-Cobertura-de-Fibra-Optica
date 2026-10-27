import type { Coordenadas } from "@/types/cobertura";

/** Resultado de validar: o coordenadas correctas, o un mensaje de error. */
export type ResultadoValidacion =
  | { ok: true; coordenadas: Coordenadas }
  | { ok: false; error: string };

// Acepta números como 19.2220, -70.5290, +19 o 19. Rechaza texto, vacíos y comas decimales.
const PATRON_NUMERO = /^[+-]?\d+(\.\d+)?$/;

/** Convierte un texto en número de forma estricta. Devuelve null si no es válido. */
function convertirNumero(texto: string): number | null {
  const limpio = texto.trim();
  if (!PATRON_NUMERO.test(limpio)) return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}

/** Comprueba que latitud y longitud estén dentro de los límites geográficos. */
export function validarCoordenadas(
  latitud: number,
  longitud: number
): ResultadoValidacion {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    return { ok: false, error: "Las coordenadas deben ser números válidos." };
  }
  if (latitud < -90 || latitud > 90) {
    return { ok: false, error: "La latitud debe estar entre -90 y 90." };
  }
  if (longitud < -180 || longitud > 180) {
    return { ok: false, error: "La longitud debe estar entre -180 y 180." };
  }
  return { ok: true, coordenadas: { latitud, longitud } };
}

/** Valida latitud y longitud escritas en dos campos separados. */
export function validarCamposSeparados(
  latitudTexto: string,
  longitudTexto: string
): ResultadoValidacion {
  const latitud = convertirNumero(latitudTexto);
  if (latitud === null) {
    return { ok: false, error: "La latitud debe ser un número, por ejemplo 19.2220." };
  }
  const longitud = convertirNumero(longitudTexto);
  if (longitud === null) {
    return { ok: false, error: "La longitud debe ser un número, por ejemplo -70.5290." };
  }
  return validarCoordenadas(latitud, longitud);
}

/** Valida coordenadas escritas en un solo campo, ej. "19.2220, -70.5290". */
export function validarCampoUnico(texto: string): ResultadoValidacion {
  const limpio = texto.trim();
  if (limpio === "") {
    return { ok: false, error: "Escribe las coordenadas, por ejemplo: 19.2220, -70.5290" };
  }

  // Separa por coma, punto y coma o espacios.
  const partes = limpio.split(/\s*[,;]\s*|\s+/);

  if (partes.length !== 2) {
    return {
      ok: false,
      error:
        "Formato no válido. Usa: 19.2220, -70.5290 (punto para los decimales y coma entre latitud y longitud).",
    };
  }

  return validarCamposSeparados(partes[0], partes[1]);
}
