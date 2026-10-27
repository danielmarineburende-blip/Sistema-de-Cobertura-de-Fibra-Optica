import { consultarCobertura } from "@/lib/cobertura";
import { PUNTOS_DE_PRUEBA } from "@/services/datosPrueba";
import type { Coordenadas } from "@/types/cobertura";

// Estas pruebas usan siempre los datos de prueba (sus resultados esperados dependen de ellos).
// Radios seguros de los puntos de prueba: 300, 250 y 200 m. Distancia máxima: 400 m.
const OPCIONES = { radioMaximoMetros: 400, cantidadCercanos: 3 };

const casos: { descripcion: string; ubicacion: Coordenadas }[] = [
  { descripcion: "Justo sobre el punto 1 (esperado: DISPONIBLE, 0 m)",
    ubicacion: { latitud: 19.222, longitud: -70.529 } },
  { descripcion: "~150 m al norte del punto 1 (esperado: DISPONIBLE)",
    ubicacion: { latitud: 19.22335, longitud: -70.529 } },
  { descripcion: "~334 m al norte del punto 1 (esperado: VERIFICACION, PRUEBA-01)",
    ubicacion: { latitud: 19.225, longitud: -70.529 } },
  { descripcion: "Junto al punto 4 inactivo (esperado: SIN COBERTURA, PRUEBA-02 ~765 m)",
    ubicacion: { latitud: 19.23, longitud: -70.52 } },
  { descripcion: "Latitud inválida (esperado: ERROR)",
    ubicacion: { latitud: 95, longitud: 10 } },
];

for (const caso of casos) {
  const r = consultarCobertura(caso.ubicacion, PUNTOS_DE_PRUEBA, OPCIONES);
  console.log(`\n${caso.descripcion}`);
  if (r.estado === "ERROR_DE_CONSULTA") {
    console.log(`  → ${r.estado}: ${r.mensaje}`);
  } else {
    console.log(`  → ${r.estado}`);
    console.log(`  → Caja: ${r.masCercano?.punto.id} a ${r.masCercano?.distanciaMetros.toFixed(0)} m`);
    console.log(`  → Cercanas: ${r.cercanos.map((c) => c.punto.id).join(", ")}`);
  }
}

// Lista vacía: no debe decir "sin cobertura", sino error.
const vacio = consultarCobertura({ latitud: 19.222, longitud: -70.529 }, [], OPCIONES);
console.log("\nSin puntos registrados (esperado: ERROR)");
console.log(`  → ${vacio.estado}`);
