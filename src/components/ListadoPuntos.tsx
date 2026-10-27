"use client";

import { useState } from "react";
import { radioMaximoDe } from "@/lib/cobertura";
import { distanciaHaversine } from "@/lib/distancia";
import { formatearMetros } from "@/lib/formato";
import type { Coordenadas, PuntoCercano, PuntoCobertura } from "@/types/cobertura";

// Máximo de resultados al buscar por nombre.
const MAXIMO_RESULTADOS_FILTRO = 20;

interface Props {
  puntos: PuntoCobertura[];         // todas las cajas (para el filtro)
  cercanos: PuntoCercano[] | null;  // las cajas más cercanas a la ubicación consultada
  ubicacion: Coordenadas | null;
  radioMaximoMetros: number;
  onVerEnMapa: (punto: PuntoCobertura) => void;
}

/** Etiqueta de zona según la distancia: disponible, verificar o fuera. */
function Zona({ punto, distancia, radioMaximoMetros }: { punto: PuntoCobertura; distancia: number; radioMaximoMetros: number }) {
  if (!punto.activo) {
    return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inactiva</span>;
  }
  if (distancia <= punto.radioMetros) {
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Disponible</span>;
  }
  if (distancia <= radioMaximoDe(punto, radioMaximoMetros)) {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Verificar</span>;
  }
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Fuera de rango</span>;
}

export default function ListadoPuntos({ puntos, cercanos, ubicacion, radioMaximoMetros, onVerEnMapa }: Props) {
  const [filtro, setFiltro] = useState("");
  const texto = filtro.trim().toLowerCase();

  // Con filtro: se busca entre todas las cajas. Sin filtro: solo las cercanas.
  let filas: { punto: PuntoCobertura; distancia: number | null }[];
  let titulo: string;
  if (texto) {
    filas = puntos
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(texto) ||
          p.id.toLowerCase().includes(texto) ||
          (p.ubicacion ?? "").toLowerCase().includes(texto)
      )
      .slice(0, MAXIMO_RESULTADOS_FILTRO)
      .map((punto) => ({ punto, distancia: ubicacion ? distanciaHaversine(ubicacion, punto) : null }));
    titulo = "Resultados de la búsqueda";
  } else if (cercanos) {
    filas = cercanos.map((c) => ({ punto: c.punto, distancia: c.distanciaMetros }));
    titulo = "Cajas NAP más cercanas";
  } else {
    filas = [];
    titulo = "Cajas NAP";
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
        <span className="text-sm text-gray-500">{puntos.length.toLocaleString("es-DO")} registradas</span>
      </div>

      <input
        type="search"
        placeholder="Buscar caja por nombre, id o ubicación (ej.: CTLV1_BZ)"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {filas.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">
          {texto
            ? "Ninguna caja coincide con la búsqueda."
            : "Consulta una ubicación para ver aquí las cajas más cercanas, o busca una caja por su nombre."}
        </p>
      ) : (
        // overflow-x-auto: en el móvil la tabla se desplaza de lado en vez de romper el diseño
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Caja</th>
                <th className="py-2 pr-3 font-medium">Coordenadas</th>
                <th className="py-2 pr-3 font-medium">Puertos</th>
                {ubicacion && <th className="py-2 pr-3 font-medium">Distancia</th>}
                {ubicacion && <th className="py-2 pr-3 font-medium">Zona</th>}
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map(({ punto, distancia }) => (
                <tr key={punto.id} className={punto.activo ? "text-gray-800" : "text-gray-400"}>
                  <td className="py-2 pr-3">
                    <div className="font-medium">{punto.nombre}</div>
                    <div className="text-xs text-gray-500">
                      id {punto.id}
                      {punto.ubicacion && <> · {punto.ubicacion}</>}
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {punto.latitud}, {punto.longitud}
                  </td>
                  <td className="py-2 pr-3">{punto.puertos ?? "—"}</td>
                  {ubicacion && (
                    <td className="py-2 pr-3">{distancia !== null ? formatearMetros(distancia) : "—"}</td>
                  )}
                  {ubicacion && (
                    <td className="py-2 pr-3">
                      {distancia !== null && (
                        <Zona punto={punto} distancia={distancia} radioMaximoMetros={radioMaximoMetros} />
                      )}
                    </td>
                  )}
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onVerEnMapa(punto)}
                      className="whitespace-nowrap text-blue-600 hover:underline"
                    >
                      Ver en mapa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
