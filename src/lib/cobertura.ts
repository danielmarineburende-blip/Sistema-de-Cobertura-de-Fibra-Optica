import type {
  Coordenadas,
  PuntoCercano,
  PuntoCobertura,
  ResultadoConsulta,
} from "@/types/cobertura";
import { validarCoordenadas } from "./coordenadas";
import { distanciaHaversine } from "./distancia";

export interface OpcionesConsulta {
  radioMaximoMetros: number; // más allá de esta distancia: sin cobertura registrada
  cantidadCercanos: number;  // cuántas cajas cercanas devolver para mostrarlas
}

/** Un punto solo se usa si está activo y todos sus datos son válidos. */
function esPuntoUtilizable(punto: PuntoCobertura): boolean {
  return (
    punto.activo &&
    validarCoordenadas(punto.latitud, punto.longitud).ok &&
    Number.isFinite(punto.radioMetros) &&
    punto.radioMetros > 0
  );
}

/**
 * Distancia máxima para un punto. Nunca es menor que su radio seguro
 * (por si un punto de prueba tiene un radio seguro mayor que el máximo general).
 */
export function radioMaximoDe(punto: PuntoCobertura, radioMaximoMetros: number): number {
  return Math.max(punto.radioMetros, radioMaximoMetros);
}

/**
 * Calcula la cobertura de una ubicación en tres niveles:
 *  - COBERTURA_DISPONIBLE:     dentro del radio seguro de alguna caja.
 *  - REQUIERE_VERIFICACION:    fuera del radio seguro, pero dentro del máximo.
 *  - SIN_COBERTURA_REGISTRADA: más lejos que el máximo de todas las cajas.
 *
 * IMPORTANTE: es una estimación en línea recta. El drop sigue las calles y
 * los postes, y no se comprueban puertos libres. Por eso existe el nivel
 * intermedio: los casos dudosos deben confirmarse con una visita técnica.
 */
export function consultarCobertura(
  ubicacion: Coordenadas,
  puntos: PuntoCobertura[],
  opciones: OpcionesConsulta
): ResultadoConsulta {
  try {
    // 1. Validar la ubicación consultada.
    const validacion = validarCoordenadas(ubicacion.latitud, ubicacion.longitud);
    if (!validacion.ok) {
      return { estado: "ERROR_DE_CONSULTA", mensaje: validacion.error };
    }

    // 2. Quedarse solo con puntos activos y con datos completos.
    const utilizables = puntos.filter(esPuntoUtilizable);
    if (utilizables.length === 0) {
      // Sin datos no podemos afirmar que "no hay cobertura": sería un resultado falso.
      return {
        estado: "ERROR_DE_CONSULTA",
        mensaje: "No hay puntos de cobertura activos registrados para comparar.",
      };
    }

    // 3. Calcular la distancia a cada punto y ordenar del más cercano al más lejano.
    const conDistancia: PuntoCercano[] = utilizables.map((punto) => ({
      punto,
      distanciaMetros: distanciaHaversine(ubicacion, punto),
    }));
    conDistancia.sort((a, b) => a.distanciaMetros - b.distanciaMetros);

    const cercanos = conDistancia.slice(0, Math.max(1, opciones.cantidadCercanos));
    const usaDatosDePrueba = utilizables.some((p) => p.origen === "prueba");
    const comun = {
      ubicacion,
      cercanos,
      radioMaximoMetros: opciones.radioMaximoMetros,
      usaDatosDePrueba,
    };

    // 4. ¿Dentro del radio seguro de alguna caja? (se revisan todas, no solo la más cercana)
    const segura = conDistancia.find((p) => p.distanciaMetros <= p.punto.radioMetros);
    if (segura) {
      return { estado: "COBERTURA_DISPONIBLE", masCercano: segura, ...comun };
    }

    // 5. ¿Dentro de la distancia máxima de alguna caja?
    const enRango = conDistancia.find(
      (p) => p.distanciaMetros <= radioMaximoDe(p.punto, opciones.radioMaximoMetros)
    );
    if (enRango) {
      return { estado: "REQUIERE_VERIFICACION", masCercano: enRango, ...comun };
    }

    // 6. Fuera de todo: se informa la caja más cercana.
    return { estado: "SIN_COBERTURA_REGISTRADA", masCercano: conDistancia[0], ...comun };
  } catch {
    return {
      estado: "ERROR_DE_CONSULTA",
      mensaje: "Ocurrió un error inesperado al calcular la cobertura.",
    };
  }
}
