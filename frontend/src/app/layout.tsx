import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuditMind — Operational Compliance Intelligence",
  description: "Remembering failures. Understanding patterns. Preventing recurrence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.className}`} style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        {/* Preconnect for external fonts and CDNs */}
        <link rel="preconnect" href="https://db.onlinewebfonts.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

        {/* BubbledotICG-FinePos Dot-Matrix Font */}
        <link
          href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
          rel="stylesheet"
          type="text/css"
        />

        {/* Font Awesome 6.5.2 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen bg-black text-white antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
