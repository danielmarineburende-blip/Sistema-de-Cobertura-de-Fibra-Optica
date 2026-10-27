// SOLO SERVIDOR: este archivo nunca debe importarse desde un componente "use client".
import type { ResultadoDireccion } from "@/types/geocodificacion";
import { validarCoordenadas } from "@/lib/coordenadas";

// Configuración por variables de entorno (con valores por defecto).
const URL_BASE = (process.env.NOMINATIM_URL ?? "https://nominatim.openstreetmap.org").replace(/\/+$/, "");
const EMAIL = process.env.NOMINATIM_EMAIL ?? "";
const PAISES = process.env.NOMINATIM_PAISES ?? "do"; // limitar a República Dominicana
const USER_AGENT = `SistemaCoberturaFibra/1.0${EMAIL ? ` (${EMAIL})` : ""}`;

const INTERVALO_MS = 1100;                     // algo más de 1 s entre consultas
const DURACION_CACHE_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAXIMO_CACHE = 500;                      // máximo de búsquedas guardadas

// --- Límite de 1 consulta por segundo (compartido por todos los usuarios) ---
let proximoTurno = 0;

async function esperarTurno(): Promise<void> {
  const ahora = Date.now();
  const turno = Math.max(ahora, proximoTurno);
  proximoTurno = turno + INTERVALO_MS; // reserva el turno antes de esperar
  const espera = turno - ahora;
  if (espera > 0) {
    await new Promise((resolver) => setTimeout(resolver, espera));
  }
}

// --- Caché en memoria ---
const cache = new Map<string, { resultados: ResultadoDireccion[]; expira: number }>();

function normalizarConsulta(texto: string): string {
  return texto.trim().replace(/\s+/g, " ").toLowerCase();
}

interface ItemNominatim {
  lat: string;
  lon: string;
  display_name: string;
}

/** Busca una dirección y devuelve hasta 5 coincidencias. */
export async function buscarDireccion(consulta: string): Promise<ResultadoDireccion[]> {
  const clave = normalizarConsulta(consulta);

  const guardado = cache.get(clave);
  if (guardado && guardado.expira > Date.now()) {
    return guardado.resultados; // respuesta inmediata, sin llamar a Nominatim
  }

  await esperarTurno();

  const url = new URL(`${URL_BASE}/search`);
  url.searchParams.set("q", consulta.trim());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "es");
  if (PAISES) url.searchParams.set("countrycodes", PAISES);
  if (EMAIL) url.searchParams.set("email", EMAIL);

  const respuesta = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000), // no esperar más de 8 segundos
    cache: "no-store",                 // la caché la gestionamos nosotros
  });

  if (!respuesta.ok) {
    throw new Error(`Nominatim respondió con estado ${respuesta.status}`);
  }

  const datos: unknown = await respuesta.json();
  if (!Array.isArray(datos)) {
    throw new Error("Respuesta inesperada de Nominatim");
  }

  // Convertir y descartar cualquier resultado con coordenadas no válidas.
  const resultados: ResultadoDireccion[] = [];
  for (const item of datos as ItemNominatim[]) {
    const latitud = Number(item.lat);
    const longitud = Number(item.lon);
    if (validarCoordenadas(latitud, longitud).ok) {
      resultados.push({ nombre: item.display_name, latitud, longitud });
    }
  }

  // Si la caché está llena, se elimina la entrada más antigua.
  if (cache.size >= MAXIMO_CACHE) {
    const masAntigua = cache.keys().next().value;
    if (masAntigua !== undefined) cache.delete(masAntigua);
  }
  cache.set(clave, { resultados, expira: Date.now() + DURACION_CACHE_MS });

  return resultados;
}
