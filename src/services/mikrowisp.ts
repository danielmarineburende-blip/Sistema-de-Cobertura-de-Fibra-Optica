// SOLO SERVIDOR: lee las cajas NAP de la base de datos de MikroWISP.
// Únicamente ejecuta consultas SELECT: nunca escribe ni modifica nada.
import mysql from "mysql2/promise";
import type { Pool, RowDataPacket } from "mysql2/promise";
import { validarCampoUnico } from "@/lib/coordenadas";
import type { PuntoCobertura, PuntoDescartado } from "@/types/cobertura";

// En desarrollo, Next.js recarga los archivos al guardarlos. Guardamos el
// "pool" de conexiones en globalThis para no abrir uno nuevo en cada recarga.
const almacenGlobal = globalThis as unknown as { poolMikrowisp?: Pool };

function obtenerPool(): Pool {
  if (almacenGlobal.poolMikrowisp) return almacenGlobal.poolMikrowisp;

  const faltantes = [
    "MIKROWISP_DB_HOST",
    "MIKROWISP_DB_NAME",
    "MIKROWISP_DB_USER",
    "MIKROWISP_DB_PASSWORD",
  ].filter((nombre) => !process.env[nombre]);
  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(", ")}`);
  }

  const tipo = (process.env.MIKROWISP_DB_TYPE ?? "mysql").trim().toLowerCase();
  if (tipo !== "mysql" && tipo !== "mariadb") {
    throw new Error(`MIKROWISP_DB_TYPE="${tipo}" no está soportado (usa mysql o mariadb).`);
  }

  almacenGlobal.poolMikrowisp = mysql.createPool({
    host: process.env.MIKROWISP_DB_HOST,
    port: Number(process.env.MIKROWISP_DB_PORT ?? 3306),
    database: process.env.MIKROWISP_DB_NAME,
    user: process.env.MIKROWISP_DB_USER,
    password: process.env.MIKROWISP_DB_PASSWORD,
    connectionLimit: 3, // pocas conexiones: la app solo lee de vez en cuando
    connectTimeout: 8000,
    enableKeepAlive: true,
  });
  return almacenGlobal.poolMikrowisp;
}

interface FilaNap extends RowDataPacket {
  id: number;
  descripcion: string | null;
  puertos: number | null;
  coordenadas: string | null;
  ubicacion: string | null;
}

/** Redondea a 6 decimales (unos 10 cm). */
function redondear(valor: number): number {
  return Math.round(valor * 1e6) / 1e6;
}

/**
 * Lee todas las cajas NAP y las convierte en puntos de cobertura.
 * Las que tienen coordenadas inválidas se devuelven aparte, en "descartados".
 */
export async function leerCajasNap(radioMetros: number): Promise<{
  puntos: PuntoCobertura[];
  descartados: PuntoDescartado[];
}> {
  const [filas] = await obtenerPool().query<FilaNap[]>(
    "SELECT id, descripcion, puertos, coordenadas, ubicacion FROM nap ORDER BY id"
  );

  const puntos: PuntoCobertura[] = [];
  const descartados: PuntoDescartado[] = [];

  for (const fila of filas) {
    const id = String(fila.id);
    const nombre = (fila.descripcion ?? "").trim() || `NAP ${id}`;
    const textoCoordenadas = String(fila.coordenadas ?? "");

    // Mismo validador que usa el formulario: "19.2220, -70.5290".
    const validacion = validarCampoUnico(textoCoordenadas);
    if (!validacion.ok) {
      descartados.push({ id, nombre, coordenadas: textoCoordenadas, motivo: validacion.error });
      continue;
    }

    puntos.push({
      id,
      nombre,
      latitud: redondear(validacion.coordenadas.latitud),
      longitud: redondear(validacion.coordenadas.longitud),
      radioMetros,
      activo: true, // MikroWISP no guarda un estado activo/inactivo
      fechaCreacion: null, // MikroWISP no guarda la fecha de creación
      origen: "base_de_datos",
      puertos: fila.puertos ?? null,
      ubicacion: (fila.ubicacion ?? "").trim() || null,
    });
  }

  return { puntos, descartados };
}
