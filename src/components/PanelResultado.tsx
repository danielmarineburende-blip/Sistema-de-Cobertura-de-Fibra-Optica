import type { ResultadoConsulta } from "@/types/cobertura";
import { formatearMetros } from "@/lib/formato";

const AVISO_ESTIMACION =
  "Estimación en línea recta según la distancia a las cajas registradas. No considera el recorrido real del drop por los postes ni los puertos libres.";

// Textos y colores de cada nivel.
const NIVELES = {
  COBERTURA_DISPONIBLE: {
    titulo: "✓ COBERTURA DISPONIBLE",
    explicacion: "La ubicación está muy cerca de una caja NAP.",
    etiquetaPunto: "Caja que da cobertura:",
    caja: "border-green-300 bg-green-50",
    texto: "text-green-800",
  },
  REQUIERE_VERIFICACION: {
    titulo: "⚠ REQUIERE VERIFICACIÓN TÉCNICA",
    explicacion:
      "Hay una caja NAP a una distancia posible, pero no segura. Confirma con un técnico si el drop puede llegar por los postes.",
    etiquetaPunto: "Caja más cercana en rango:",
    caja: "border-amber-300 bg-amber-50",
    texto: "text-amber-800",
  },
  SIN_COBERTURA_REGISTRADA: {
    titulo: "✕ SIN COBERTURA REGISTRADA",
    explicacion: "No hay ninguna caja NAP registrada dentro de la distancia máxima.",
    etiquetaPunto: "Caja más cercana:",
    caja: "border-red-300 bg-red-50",
    texto: "text-red-800",
  },
} as const;

export default function PanelResultado({ resultado }: { resultado: ResultadoConsulta | null }) {
  // Sin consulta todavía
  if (!resultado) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
        Introduce una dirección o unas coordenadas, o haz clic en el mapa, para consultar la
        cobertura.
      </div>
    );
  }

  // Error
  if (resultado.estado === "ERROR_DE_CONSULTA") {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-100 p-4 shadow-sm" role="status">
        <p className="text-lg font-bold text-gray-800">ERROR DE CONSULTA</p>
        <p className="mt-1 text-sm text-gray-700">{resultado.mensaje}</p>
      </div>
    );
  }

  const nivel = NIVELES[resultado.estado];
  const cercano = resultado.masCercano;

  return (
    <div role="status" className={`rounded-lg border p-4 shadow-sm ${nivel.caja}`}>
      <p className={`text-lg font-bold ${nivel.texto}`}>{nivel.titulo}</p>
      <p className="mt-1 text-sm text-gray-700">{nivel.explicacion}</p>

      <p className="mt-2 text-xs text-gray-600">
        Ubicación: {resultado.ubicacion.latitud}, {resultado.ubicacion.longitud}
      </p>

      {cercano && (
        <div className="mt-3 rounded-md bg-white/70 p-3 text-sm text-gray-800">
          <p className="font-medium">{nivel.etiquetaPunto}</p>
          <p>{cercano.punto.nombre}</p>
          {cercano.punto.ubicacion && <p className="text-xs text-gray-500">{cercano.punto.ubicacion}</p>}
          <p className="mt-1">
            Distancia: <strong>{formatearMetros(cercano.distanciaMetros)}</strong>
          </p>
          {cercano.punto.puertos != null && <p>Puertos de la caja: {cercano.punto.puertos}</p>}
        </div>
      )}

      {resultado.usaDatosDePrueba && (
        <p className="mt-3 text-xs font-medium text-amber-800">⚠ Calculado con datos de prueba.</p>
      )}

      <p className="mt-2 text-xs text-gray-600">{AVISO_ESTIMACION}</p>
    </div>
  );
}
