import type { Metadata } from "next";
import type { ReactNode } from "react";
// Fuentes Geist incluidas en el proyecto (paquete "geist"):
// no necesitan internet al compilar, ni en Docker.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Cobertura de Fibra Óptica",
  description: "Consulta de cobertura de fibra óptica por coordenadas o dirección",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
