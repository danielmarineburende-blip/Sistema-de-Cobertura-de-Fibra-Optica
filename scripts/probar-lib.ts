import { distanciaHaversine } from "@/lib/distancia";
import { validarCampoUnico, validarCamposSeparados } from "@/lib/coordenadas";

console.log("=== Distancias ===");
const base = { latitud: 19.222, longitud: -70.529 };
console.log("Mismo punto (esperado 0 m):", distanciaHaversine(base, base).toFixed(1));
console.log("0.01° al norte (esperado ~1112 m):",
  distanciaHaversine(base, { latitud: 19.232, longitud: -70.529 }).toFixed(1));
console.log("0.01° al este (esperado ~1050 m):",
  distanciaHaversine(base, { latitud: 19.222, longitud: -70.519 }).toFixed(1));

console.log("\n=== Validación de campo único ===");
const casos = ["19.2220, -70.5290", "19.2220 -70.5290", "19,2220, -70,5290", "95, 10", "", "hola, mundo"];
for (const texto of casos) {
  console.log(JSON.stringify(texto), "→", validarCampoUnico(texto));
}

console.log("\n=== Validación de campos separados ===");
console.log('("", "-70.5290") →', validarCamposSeparados("", "-70.5290"));
console.log('("19.2220", "-200") →', validarCamposSeparados("19.2220", "-200"));
