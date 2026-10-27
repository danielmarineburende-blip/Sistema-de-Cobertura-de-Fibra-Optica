"use client";

import { useState } from "react";
import MapaDinamico from "./MapaDinamico";
import BusquedaDireccion from "./BusquedaDireccion";
import FormularioCoordenadas from "./FormularioCoordenadas";
import PanelResultado from "./PanelResultado";
import ListadoPuntos from "./ListadoPuntos";
import AvisosCarga from "./AvisosCarga";
import { consultarCobertura } from "@/lib/cobertura";
import type { CargaPuntos, Coordenadas, PuntoCobertura } from "@/types/cobertura";

export default function ConsultaCobertura({ carga }: { carga: CargaPuntos }) {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [enfoque, setEnfoque] = useState<PuntoCobertura | null>(null);
  const { puntos, configuracion } = carga;

  // Se recalcula cada vez que cambia la ubicación (formulario, búsqueda, clic o arrastre).
  const resultado = ubicacion
    ? consultarCobertura(ubicacion, puntos, {
        radioMaximoMetros: configuracion.radioMaximoMetros,
        cantidadCercanos: configuracion.cantidadCercanos,
      })
    : null;

  const cercanos = resultado && resultado.estado !== "ERROR_DE_CONSULTA" ? resultado.cercanos : null;

  // En el mapa solo se dibujan las cajas cercanas, más la que se pidió ver desde el listado.
  const puntosVisibles = cercanos ? cercanos.map((c) => c.punto) : [];
  if (enfoque && !puntosVisibles.some((p) => p.id === enfoque.id)) {
    puntosVisibles.push(enfoque);
  }

  // Se crea un objeto nuevo en cada clic para que el mapa vuele aunque sea la misma caja.
  function verEnMapa(punto: PuntoCobertura) {
    setEnfoque({ ...punto });
  }

  return (
    <div className="space-y-4">
      <AvisosCarga carga={carga} />

      {/* En pantallas grandes: panel a la izquierda y mapa a la derecha. En móvil: uno debajo del otro. */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <BusquedaDireccion onSeleccionar={setUbicacion} />
          <FormularioCoordenadas onConsultar={setUbicacion} />
          <PanelResultado resultado={resultado} />
        </div>

        <div>
          <MapaDinamico
            puntosVisibles={puntosVisibles}
            radioMaximoMetros={configuracion.radioMaximoMetros}
            ubicacion={ubicacion}
            resultado={resultado}
            enfoque={enfoque}
            onCambiarUbicacion={setUbicacion}
          />
          <p className="mt-2 text-xs text-gray-500">
            {ubicacion
              ? `Se muestran las ${configuracion.cantidadCercanos} cajas más cercanas. Haz clic en el mapa o arrastra el marcador para consultar otra ubicación.`
              : "Consulta una ubicación (o haz clic en el mapa) para ver las cajas NAP cercanas."}
          </p>
        </div>
      </div>

      <ListadoPuntos
        puntos={puntos}
        cercanos={cercanos}
        ubicacion={ubicacion}
        radioMaximoMetros={configuracion.radioMaximoMetros}
        onVerEnMapa={verEnMapa}
      />
    </div>
  );
}
