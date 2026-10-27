import type { CargaPuntos } from "@/types/cobertura";

/** Avisos sobre el origen de los datos: prueba, errores, configuración y terminales descartadas. */
export default function AvisosCarga({ carga }: { carga: CargaPuntos }) {
  const { radioSeguroMetros, radioMaximoMetros } = carga.configuracion;

  return (
    <div className="space-y-2">
      {carga.origen === "prueba" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Se están usando <strong>datos de prueba</strong>. Los puntos mostrados no representan
          infraestructura real de la empresa.
        </div>
      )}

      {carga.error && (
        <div
          role="alert"
          className="rounded-lg border border-gray-400 bg-gray-100 px-4 py-3 text-sm text-gray-900"
        >
          <strong>No se pudieron cargar las terminales.</strong> {carga.error}
        </div>
      )}

      {!carga.error && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          <span>
            {carga.origen === "base_de_datos" ? "Terminales del sistema ISP" : "Puntos de prueba"}:{" "}
            <strong>{carga.puntos.length.toLocaleString("es-DO")}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600" />
            Disponible hasta <strong>{radioSeguroMetros} m</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            Verificar hasta <strong>{radioMaximoMetros} m</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" />
            Más lejos: sin cobertura
          </span>
        </div>
      )}

      {carga.descartados.length > 0 && (
        <details className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <summary className="cursor-pointer">
            Se ignoraron <strong>{carga.descartados.length}</strong> terminal(es) con coordenadas no
            válidas. Corrígelas en el sistema ISP.
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {carga.descartados.slice(0, 20).map((d) => (
              <li key={d.id}>
                {d.nombre} (id {d.id}): <code className="font-mono">&quot;{d.coordenadas}&quot;</code>
              </li>
            ))}
          </ul>
          {carga.descartados.length > 20 && (
            <p className="mt-1">… y {carga.descartados.length - 20} más.</p>
          )}
        </details>
      )}
    </div>
  );
}
