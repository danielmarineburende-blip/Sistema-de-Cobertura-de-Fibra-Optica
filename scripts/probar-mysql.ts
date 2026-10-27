// Prueba de conexión a la base de datos de MikroWISP (solo lectura).
// Uso: npx tsx scripts/probar-mysql.ts
import mysql from "mysql2/promise";
import { validarCampoUnico } from "@/lib/coordenadas";

// Carga las variables de .env.local (Next.js lo hace solo, pero este script no).
process.loadEnvFile(".env.local");

async function main() {
  const faltantes = [
    "MIKROWISP_DB_HOST",
    "MIKROWISP_DB_NAME",
    "MIKROWISP_DB_USER",
    "MIKROWISP_DB_PASSWORD",
  ].filter((nombre) => !process.env[nombre]);

  if (faltantes.length > 0) {
    console.error("Faltan variables en .env.local:", faltantes.join(", "));
    process.exit(1);
  }

  console.log(
    `Conectando a ${process.env.MIKROWISP_DB_HOST}:${process.env.MIKROWISP_DB_PORT ?? 3306} / ${process.env.MIKROWISP_DB_NAME} ...`
  );

  const conexion = await mysql.createConnection({
    host: process.env.MIKROWISP_DB_HOST,
    port: Number(process.env.MIKROWISP_DB_PORT ?? 3306),
    database: process.env.MIKROWISP_DB_NAME,
    user: process.env.MIKROWISP_DB_USER,
    password: process.env.MIKROWISP_DB_PASSWORD,
    connectTimeout: 8000,
  });

  try {
    const [version] = await conexion.query<mysql.RowDataPacket[]>("SELECT VERSION() AS version");
    console.log("✓ Conectado. Versión de MySQL:", version[0].version);

    const [filas] = await conexion.query<mysql.RowDataPacket[]>(
      "SELECT id, descripcion, puertos, coordenadas FROM nap"
    );

    let validas = 0;
    const invalidas: string[] = [];
    for (const fila of filas) {
      if (validarCampoUnico(String(fila.coordenadas ?? "")).ok) {
        validas++;
      } else {
        invalidas.push(`id ${fila.id} (${fila.descripcion}): "${fila.coordenadas}"`);
      }
    }

    console.log(`✓ Cajas NAP leídas: ${filas.length}`);
    console.log(`  Coordenadas válidas:   ${validas}`);
    console.log(`  Coordenadas inválidas: ${invalidas.length}`);
    invalidas.slice(0, 10).forEach((texto) => console.log("   -", texto));
  } finally {
    await conexion.end();
  }
}

main().catch((error: unknown) => {
  const e = error as { code?: string; message?: string };
  console.error("✕ Error de conexión:", e.code ?? "", e.message ?? error);
  process.exit(1);
});
