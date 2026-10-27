"use client";

import { useState } from "react";
import { validarCampoUnico, validarCamposSeparados } from "@/lib/coordenadas";
import type { Coordenadas } from "@/types/cobertura";

type Modo = "separados" | "unico";

interface Props {
  onConsultar: (coordenadas: Coordenadas) => void;
}

export default function FormularioCoordenadas({ onConsultar }: Props) {
  const [modo, setModo] = useState<Modo>("separados");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  function consultar() {
    const resultado =
      modo === "separados"
        ? validarCamposSeparados(latitud, longitud)
        : validarCampoUnico(texto);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    onConsultar(resultado.coordenadas);
  }

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setError(null);
  }

  const estiloInput =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  const estiloPestana = (activa: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
      activa ? "bg-white text-gray-900 shadow" : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // evita que la página se recargue
        consultar();
      }}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Consulta por coordenadas</h2>

      {/* Selector de formato */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button type="button" onClick={() => cambiarModo("separados")} className={estiloPestana(modo === "separados")}>
          Dos campos
        </button>
        <button type="button" onClick={() => cambiarModo("unico")} className={estiloPestana(modo === "unico")}>
          Un solo campo
        </button>
      </div>

      {modo === "separados" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-gray-700">
            Latitud
            <input
              type="text"
              inputMode="decimal"
              placeholder="19.2220"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              className={`mt-1 ${estiloInput}`}
            />
          </label>
          <label className="block text-sm text-gray-700">
            Longitud
            <input
              type="text"
              inputMode="decimal"
              placeholder="-70.5290"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              className={`mt-1 ${estiloInput}`}
            />
          </label>
        </div>
      ) : (
        <label className="block text-sm text-gray-700">
          Latitud, longitud
          <input
            type="text"
            placeholder="19.2220, -70.5290"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className={`mt-1 ${estiloInput}`}
          />
        </label>
      )}

      {error && (
        <p className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
      >
        Consultar cobertura
      </button>
    </form>
  );
}
