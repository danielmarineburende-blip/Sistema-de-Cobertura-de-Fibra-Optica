"use client";

import { useState } from "react";
import type { Coordenadas } from "@/types/cobertura";
import type { RespuestaGeocodificacion, ResultadoDireccion } from "@/types/geocodificacion";

interface Props {
  onSeleccionar: (coordenadas: Coordenadas) => void;
}

export default function BusquedaDireccion({ onSeleccionar }: Props) {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opciones, setOpciones] = useState<ResultadoDireccion[]>([]);
  const [elegida, setElegida] = useState<string | null>(null);

  function elegir(resultado: ResultadoDireccion) {
    setElegida(resultado.nombre);
    setOpciones([]);
    onSeleccionar({ latitud: resultado.latitud, longitud: resultado.longitud });
  }

  async function buscar() {
    const consulta = texto.trim();
    if (consulta.length < 3) {
      setError("Escribe al menos 3 caracteres.");
      return;
    }

    setCargando(true);
    setError(null);
    setOpciones([]);
    setElegida(null);

    try {
      const respuesta = await fetch(`/api/geocodificar?q=${encodeURIComponent(consulta)}`);
      const datos = (await respuesta.json()) as RespuestaGeocodificacion;

      if (!datos.ok) {
        setError(datos.error);
      } else if (datos.resultados.length === 0) {
        setError("No se encontró la dirección. Prueba a escribirla de otra forma o usa coordenadas.");
      } else if (datos.resultados.length === 1) {
        elegir(datos.resultados[0]); // una sola coincidencia: se usa directamente
      } else {
        setOpciones(datos.resultados); // varias: el usuario elige
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!cargando) buscar();
      }}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Consulta por dirección</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ej.: Parque Duarte, La Vega"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={200}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={cargando}
          className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:cursor-wait disabled:opacity-60"
        >
          {cargando ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800" role="alert">
          {error}
        </p>
      )}

      {opciones.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Se encontraron varias coincidencias:</p>
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
            {opciones.map((opcion) => (
              <li key={`${opcion.latitud},${opcion.longitud},${opcion.nombre}`}>
                <button
                  type="button"
                  onClick={() => elegir(opcion)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                >
                  {opcion.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {elegida && (
        <p className="text-sm text-gray-700">
          <span className="font-medium">Encontrada:</span> {elegida}
          <br />
          <span className="text-xs text-gray-500">
            La posición puede ser aproximada. Verifica y ajusta el marcador en el mapa si es necesario.
          </span>
        </p>
      )}

      <p className="text-xs text-gray-400">Búsqueda: Nominatim © colaboradores de OpenStreetMap</p>
    </form>
  );
}
