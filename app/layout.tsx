import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Photo Rank",
  description: "Fotos, votos y ranking en vivo para eventos."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
