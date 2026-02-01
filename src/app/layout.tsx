import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelSmart - Pixel Art Generator",
  description: "Transform images into pixel art with custom palettes, filters, and precise controls. Client-side processing, no uploads required.",
  keywords: ["pixel art", "image converter", "retro art", "palette", "pixelation"],
  authors: [{ name: "unworthyzeus" }],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PixelSmart',
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "PixelSmart - Pixel Art Generator",
    description: "Transform images into pixel art with custom palettes and filters.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixelSmart",
    description: "Transform images into pixel art",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
