import path from "node:path";
import type { NextConfig } from "next";

// Carpeta raíz del proyecto (donde está este archivo).
// Se indica explícitamente para que Next.js no use por error archivos
// package.json / package-lock.json / postcss.config.mjs de carpetas superiores.
const raizProyecto = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Genera un servidor mínimo en .next/standalone (se usará en Docker).
  output: "standalone",
  outputFileTracingRoot: raizProyecto,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: raizProyecto,
    // IMPORTANTE: esta regla conecta Tailwind CSS con Next.js.
    // Si se borra, la página se ve sin diseño.
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
