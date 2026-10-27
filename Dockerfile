# =============================================================
#  Sistema de Cobertura de Fibra Óptica — imagen de producción
#  Construcción en 3 etapas: dependencias → compilación → ejecución.
#  La imagen final solo contiene el servidor "standalone" de Next.js:
#  sin código fuente, sin herramientas de desarrollo y sin secretos.
# =============================================================

# Versión de Node.js (la misma rama que usas en tu PC).
ARG NODE_VERSION=24

# ---------- Etapa 1: instalar dependencias ----------
FROM node:${NODE_VERSION}-slim AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci instala exactamente las versiones de package-lock.json.
RUN npm ci --no-audit --no-fund

# ---------- Etapa 2: compilar ----------
FROM node:${NODE_VERSION}-slim AS compilacion
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
# La compilación NO necesita la base de datos: las cajas NAP se leen en cada visita.
RUN npm run build

# ---------- Etapa 3: imagen final ----------
FROM node:${NODE_VERSION}-slim AS ejecucion
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Servidor mínimo + archivos estáticos (CSS, JS del navegador, imágenes).
# El usuario "node" ya existe en la imagen oficial; la app no se ejecuta como root.
COPY --from=compilacion --chown=node:node /app/.next/standalone ./
COPY --from=compilacion --chown=node:node /app/.next/static ./.next/static
COPY --from=compilacion --chown=node:node /app/public ./public

USER node

# Puerto dentro del contenedor (en el equipo se publica el que elijas en docker-compose).
EXPOSE 3000

# Docker comprueba cada 30 s que la app responde.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
