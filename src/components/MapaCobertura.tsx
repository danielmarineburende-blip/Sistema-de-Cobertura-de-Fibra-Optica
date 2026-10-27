"use client";

import { Fragment, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { radioMaximoDe } from "@/lib/cobertura";
import type {
  Coordenadas,
  EstadoCobertura,
  PuntoCobertura,
  ResultadoConsulta,
} from "@/types/cobertura";

const CENTRO_INICIAL: [number, number] = [19.222, -70.529];
const ZOOM_INICIAL = 15;

// Colores de los niveles de cobertura.
const VERDE = "#16a34a";
const AMBAR = "#d97706";
const ROJO = "#dc2626";
const NEUTRO = "#0f172a";
const AZUL = "#2563eb";

const COLORES_RESULTADO: Record<EstadoCobertura, string> = {
  COBERTURA_DISPONIBLE: VERDE,
  REQUIERE_VERIFICACION: AMBAR,
  SIN_COBERTURA_REGISTRADA: ROJO,
  ERROR_DE_CONSULTA: NEUTRO,
};

// Se guarda un icono por color para no crearlo de nuevo en cada actualización.
// Usamos divIcon (HTML + CSS) porque el icono por defecto de Leaflet
// busca imágenes que Next.js no encuentra, y el marcador saldría roto.
const iconosPorColor = new Map<string, L.DivIcon>();

function iconoConsulta(color: string): L.DivIcon {
  let icono = iconosPorColor.get(color);
  if (!icono) {
    icono = L.divIcon({
      className: "",
      html: `<div style="width:24px;height:24px;background:${color};border:3px solid #ffffff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.5);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 29],
      popupAnchor: [0, -28],
    });
    iconosPorColor.set(color, icono);
  }
  return icono;
}

/** Redondea a 6 decimales (precisión de unos 10 cm). */
function redondear(valor: number): number {
  return Math.round(valor * 1e6) / 1e6;
}

/** Escucha los clics en el mapa y avisa de la nueva ubicación. */
function EventosMapa({ onSeleccionar }: { onSeleccionar: (c: Coordenadas) => void }) {
  useMapEvents({
    click(e) {
      // wrap() corrige longitudes fuera de -180..180 si el mapa se ha desplazado mucho.
      const p = e.latlng.wrap();
      onSeleccionar({ latitud: redondear(p.lat), longitud: redondear(p.lng) });
    },
  });
  return null;
}

/** Si la ubicación consultada queda fuera de la vista, mueve el mapa hasta ella. */
function SeguirUbicacion({ ubicacion }: { ubicacion: Coordenadas | null }) {
  const map = useMap();
  useEffect(() => {
    if (!ubicacion) return;
    const destino = L.latLng(ubicacion.latitud, ubicacion.longitud);
    if (!map.getBounds().contains(destino)) {
      map.setView(destino, Math.max(map.getZoom(), ZOOM_INICIAL));
    }
  }, [map, ubicacion]);
  return null;
}

/** Vuela hasta una caja cuando se pulsa "Ver en mapa" en el listado. */
function EnfocarPunto({ enfoque }: { enfoque: PuntoCobertura | null }) {
  const map = useMap();
  useEffect(() => {
    if (enfoque) map.flyTo([enfoque.latitud, enfoque.longitud], 17);
  }, [map, enfoque]);
  return null;
}

interface Props {
  puntosVisibles: PuntoCobertura[]; // solo las cajas que se deben dibujar (las cercanas)
  radioMaximoMetros: number;
  ubicacion: Coordenadas | null;
  resultado: ResultadoConsulta | null;
  enfoque: PuntoCobertura | null;
  onCambiarUbicacion: (c: Coordenadas) => void;
}

export default function MapaCobertura({
  puntosVisibles,
  radioMaximoMetros,
  ubicacion,
  resultado,
  enfoque,
  onCambiarUbicacion,
}: Props) {
  const colorMarcador = resultado ? COLORES_RESULTADO[resultado.estado] : NEUTRO;

  // Caja que justifica el resultado (solo si la consulta no dio error).
  const masCercano =
    resultado && resultado.estado !== "ERROR_DE_CONSULTA" ? resultado.masCercano : null;

  return (
    <MapContainer
      center={CENTRO_INICIAL}
      zoom={ZOOM_INICIAL}
      scrollWheelZoom
      preferCanvas // dibuja los círculos en un <canvas>: más rápido
      className="h-[420px] w-full rounded-lg border border-gray-300 md:h-[560px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Cajas cercanas: anillo de verificación (ámbar, discontinuo), zona segura (verde) y punto central */}
      {puntosVisibles.map((p) => {
        const esLaDelResultado = masCercano?.punto.id === p.id;
        return (
          <Fragment key={p.id}>
            <Circle
              center={[p.latitud, p.longitud]}
              radius={radioMaximoDe(p, radioMaximoMetros)}
              interactive={false}
              pathOptions={{ color: AMBAR, weight: 1, dashArray: "5 6", fillColor: AMBAR, fillOpacity: 0.04 }}
            />
            <Circle
              center={[p.latitud, p.longitud]}
              radius={p.radioMetros}
              interactive={false} // los clics pasan al mapa y mueven el marcador
              pathOptions={{ color: VERDE, weight: 1.5, fillColor: VERDE, fillOpacity: 0.12 }}
            />
            <CircleMarker
              center={[p.latitud, p.longitud]}
              radius={esLaDelResultado ? 7 : 5}
              bubblingMouseEvents={false} // al hacer clic aquí solo se abre la ficha
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: AZUL, fillOpacity: 1 }}
            >
              <Popup>
                <strong>{p.nombre}</strong>
                {p.ubicacion && (
                  <>
                    <br />
                    {p.ubicacion}
                  </>
                )}
                {p.puertos != null && (
                  <>
                    <br />
                    Puertos: {p.puertos}
                  </>
                )}
                <br />
                Disponible hasta {p.radioMetros} m · verificar hasta{" "}
                {radioMaximoDe(p, radioMaximoMetros)} m
                <br />
                {p.latitud}, {p.longitud}
              </Popup>
            </CircleMarker>
          </Fragment>
        );
      })}

      {/* Línea hasta la caja que justifica el resultado */}
      {ubicacion && masCercano && (
        <Polyline
          positions={[
            [ubicacion.latitud, ubicacion.longitud],
            [masCercano.punto.latitud, masCercano.punto.longitud],
          ]}
          interactive={false}
          pathOptions={{ color: colorMarcador, weight: 2, dashArray: "4 6" }}
        />
      )}

      {/* Ubicación consultada: se puede arrastrar */}
      {ubicacion && (
        <Marker
          position={[ubicacion.latitud, ubicacion.longitud]}
          icon={iconoConsulta(colorMarcador)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng().wrap();
              onCambiarUbicacion({ latitud: redondear(p.lat), longitud: redondear(p.lng) });
            },
          }}
        >
          <Popup>
            <strong>Ubicación consultada</strong>
            <br />
            {ubicacion.latitud}, {ubicacion.longitud}
          </Popup>
        </Marker>
      )}

      <EventosMapa onSeleccionar={onCambiarUbicacion} />
      <SeguirUbicacion ubicacion={ubicacion} />
      <EnfocarPunto enfoque={enfoque} />
    </MapContainer>
  );
}
