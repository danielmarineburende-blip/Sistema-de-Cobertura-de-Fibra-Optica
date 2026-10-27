import { Suspense } from "react";
import { connection } from "next/server";
import ConsultaCobertura from "@/components/ConsultaCobertura";
import { obtenerPuntosCobertura } from "@/services/puntosCobertura";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Sistema de Cobertura de Fibra Óptica
      </h1>

      {/* Mientras se leen las terminales se muestra este aviso. */}
      <Suspense
        fallback={
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
            Cargando terminales de cobertura…
          </div>
        }
      >
        <SeccionCobertura />
      </Suspense>
    </main>
  );
}

async function SeccionCobertura() {
  // connection() indica que esto se ejecuta en cada visita y NUNCA al compilar.
  // Así la compilación (y Docker) no necesitan acceso a la base de datos, y
  // las terminales nuevas aparecen sin recompilar.
  await connection();
  const carga = await obtenerPuntosCobertura();
  return <ConsultaCobertura carga={carga} />;
}
