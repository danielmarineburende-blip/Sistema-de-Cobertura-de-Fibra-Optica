"use client";

import dynamic from "next/dynamic";

// ssr: false → el mapa nunca se carga en el servidor, evitando "window is not defined".
const MapaDinamico = dynamic(() => import("./MapaCobertura"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-500 md:h-[560px]">
      Cargando mapa…
    </div>
  ),
});

export default MapaDinamico;
