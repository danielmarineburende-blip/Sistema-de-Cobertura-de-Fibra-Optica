import type { Coordenadas } from "@/types/cobertura";

// Radio medio de la Tierra en metros.
const RADIO_TIERRA_METROS = 6_371_008.8;

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/**
 * Distancia en metros entre dos puntos usando la fórmula de Haversine.
 * Considera que la Tierra es una esfera: el error es menor al 0.5 %,
 * más que suficiente para radios de cobertura de cientos de metros.
 */
export function distanciaHaversine(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLon = aRadianes(b.longitud - a.longitud);
  const lat1 = aRadianes(a.latitud);
  const lat2 = aRadianes(b.latitud);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  // Math.min evita errores de redondeo que podrían dar un valor mayor que 1.
  return 2 * RADIO_TIERRA_METROS * Math.asin(Math.min(1, Math.sqrt(h)));
}
