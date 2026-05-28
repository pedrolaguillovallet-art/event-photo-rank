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
  const clearLegacyParticipantSession = `
try {
  if (!window.localStorage.getItem("event-photo-rank-auth")) {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("eventrank-participant-"))
      .forEach((key) => window.localStorage.removeItem(key));
  }
} catch {}
`;

  return (
    <html lang="es">
      <body>
        <script dangerouslySetInnerHTML={{ __html: clearLegacyParticipantSession }} />
        {children}
      </body>
    </html>
  );
}
