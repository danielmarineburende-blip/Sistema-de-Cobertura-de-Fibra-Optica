import { NextRequest, NextResponse } from "next/server";
import { buscarDireccion } from "@/services/geocodificacion";
import type { RespuestaGeocodificacion } from "@/types/geocodificacion";

// GET /api/geocodificar?q=Parque Duarte, La Vega
export async function GET(request: NextRequest) {
  const consulta = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (consulta.length < 3 || consulta.length > 200) {
    return NextResponse.json<RespuestaGeocodificacion>(
      { ok: false, error: "Escribe una dirección de entre 3 y 200 caracteres." },
      { status: 400 }
    );
  }

  try {
    const resultados = await buscarDireccion(consulta);
    return NextResponse.json<RespuestaGeocodificacion>({ ok: true, resultados });
  } catch (error) {
    console.error("Error de geocodificación:", error);
    return NextResponse.json<RespuestaGeocodificacion>(
      {
        ok: false,
        error:
          "El servicio de búsqueda de direcciones no está disponible en este momento. Inténtalo de nuevo o usa coordenadas.",
      },
      { status: 502 }
    );
  }
}
