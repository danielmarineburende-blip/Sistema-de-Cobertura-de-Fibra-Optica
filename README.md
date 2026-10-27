# Sistema de Cobertura de Fibra Óptica

Aplicación web (Next.js + TypeScript + Tailwind + Leaflet) para consultar si una
ubicación tiene cobertura de fibra óptica según las cajas NAP registradas en
MikroWISP (o datos de prueba).

El resultado tiene tres niveles según la distancia en línea recta a la caja más cercana:

| Distancia                    | Resultado                         |
|------------------------------|-----------------------------------|
| hasta `RADIO_SEGURO_METROS`  | Cobertura disponible (verde)      |
| hasta `RADIO_MAXIMO_METROS`  | Requiere verificación (amarillo)  |
| más lejos                    | Sin cobertura registrada (rojo)   |

Es una **estimación**: no considera el recorrido real del drop ni los puertos libres.

---

## Desarrollo (en tu PC)

1. Copia `.env.example` como `.env.local` y completa los valores.
2. `npm install`
3. `npm run dev` → http://localhost:3000

Comprobaciones:

- Tipos: `npx tsc --noEmit`
- Lint: `npm run lint`
- Compilación de producción: `npm run build`
- Pruebas de lógica: `npx tsx scripts/probar-cobertura.ts`
- Conexión a MikroWISP: `npx tsx scripts/probar-mysql.ts`

---

## Docker (local)

1. Copia `.env.docker.example` como `.env` y completa los valores
   (si un valor contiene `$`, escríbelo como `$$`).
2. Construye la imagen: `docker compose build`
3. Inicia: `docker compose up -d`
4. Abre http://localhost:3001 (o el puerto de `PUERTO_HOST`).

Comandos útiles:

| Acción                    | Comando                            |
|---------------------------|------------------------------------|
| Ver estado y salud        | `docker compose ps`                |
| Ver registros             | `docker compose logs -f`           |
| Detener                   | `docker compose down`              |
| Reconstruir tras cambios  | `docker compose up -d --build`     |

La app escucha en el puerto **3000 dentro del contenedor** y se publica en el
equipo en `PUERTO_HOST` (3001 por defecto), para no chocar con otros servicios.

La imagen no contiene código fuente, herramientas de desarrollo ni secretos:
las credenciales se pasan como variables de entorno al iniciar el contenedor.

---

## Importante

- `next.config.ts` contiene la regla `turbopack.rules` que conecta Tailwind y
  fija la raíz del proyecto. Si se borra, la página se ve sin diseño.
- El usuario de MikroWISP debe ser de **solo lectura**: la app solo ejecuta `SELECT` sobre la tabla `nap`.
- Las cajas con coordenadas inválidas se ignoran y se listan en un aviso para corregirlas en MikroWISP.
