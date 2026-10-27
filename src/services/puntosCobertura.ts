// SOLO SERVIDOR: única puerta de entrada a los puntos de cobertura.
import type { CargaPuntos, ConfiguracionConsulta } from "@/types/cobertura";
import { PUNTOS_DE_PRUEBA } from "./datosPrueba";
import { leerCajasNap } from "./mikrowisp";

/** Lee un número entero de una variable de entorno, dentro de un rango; si no, usa el valor por defecto. */
function leerNumero(
  nombres: string[],
  porDefecto: number,
  minimo: number,
  maximo: number
): number {
  for (const nombre of nombres) {
    const texto = process.env[nombre];
    if (texto === undefined || texto.trim() === "") continue;
    const valor = Number(texto);
    if (Number.isFinite(valor) && valor >= minimo && valor <= maximo) return Math.round(valor);
    console.warn(`La variable ${nombre}="${texto}" no es válida; se usa ${porDefecto}.`);
    return porDefecto;
  }
  return porDefecto;
}

/** Configuración de la consulta a partir de las variables de entorno. */
function leerConfiguracion(): ConfiguracionConsulta {
  // RADIO_COBERTURA_METROS se acepta por compatibilidad con la versión anterior.
  const radioSeguroMetros = leerNumero(["RADIO_SEGURO_METROS", "RADIO_COBERTURA_METROS"], 80, 1, 5000);
  const radioMaximoMetros = Math.max(
    radioSeguroMetros, // el máximo nunca puede ser menor que el seguro
    leerNumero(["RADIO_MAXIMO_METROS"], 250, 1, 5000)
  );
  const cantidadCercanos = leerNumero(["TERMINALES_CERCANAS"], 10, 1, 50);
  return { radioSeguroMetros, radioMaximoMetros, cantidadCercanos };
}

/** Segundos que se guardan en memoria los puntos leídos (variable CACHE_PUNTOS_SEGUNDOS). */
function leerDuracionCacheMs(): number {
  return leerNumero(["CACHE_PUNTOS_SEGUNDOS"], 60, 0, 86_400) * 1000;
}

// Caché en memoria: evita consultar MikroWISP en cada visita a la página.
let cache: { carga: CargaPuntos; expira: number } | null = null;

/**
 * Devuelve los puntos de cobertura según DATA_SOURCE:
 * - "prueba"    → datos de demostración.
 * - "mikrowisp" → cajas NAP reales de MikroWISP.
 *
 * Si MikroWISP falla, NO se usan datos de prueba como respaldo: eso daría
 * resultados falsos. Se devuelve una lista vacía con un mensaje de error.
 */
export async function obtenerPuntosCobertura(): Promise<CargaPuntos> {
  const configuracion = leerConfiguracion();
  const origen = (process.env.DATA_SOURCE ?? "prueba").trim().toLowerCase();

  if (origen === "prueba") {
    return { origen: "prueba", puntos: PUNTOS_DE_PRUEBA, descartados: [], error: null, configuracion };
  }

  if (origen !== "mikrowisp") {
    return {
      origen: "base_de_datos",
      puntos: [],
      descartados: [],
      error: `La variable DATA_SOURCE tiene un valor no válido ("${origen}"). Usa "prueba" o "mikrowisp".`,
      configuracion,
    };
  }

  if (cache && cache.expira > Date.now()) {
    return cache.carga;
  }

  try {
    const { puntos, descartados } = await leerCajasNap(configuracion.radioSeguroMetros);
    const carga: CargaPuntos = { origen: "base_de_datos", puntos, descartados, error: null, configuracion };
    cache = { carga, expira: Date.now() + leerDuracionCacheMs() };
    return carga;
  } catch (error) {
    // El detalle técnico va al registro del servidor, no a la pantalla.
    console.error("Error al leer las cajas NAP de MikroWISP:", error);
    return {
      origen: "base_de_datos",
      puntos: [],
      descartados: [],
      error:
        "No se pudieron leer las terminales del sistema ISP. Las consultas de cobertura no están disponibles hasta que se restablezca la conexión.",
      configuracion,
    };
  }
}
