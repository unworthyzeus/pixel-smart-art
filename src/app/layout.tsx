import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelSmart Art | AI-Powered Pixel Art Generator",
  description: "Transform your images into stunning pixel art with smart color palettes, filters, and precise controls. Create retro-style artwork with modern AI technology.",
  keywords: ["pixel art", "image converter", "retro art", "palette generator", "pixelation", "8-bit art"],
  authors: [{ name: "PixelSmart" }],
  openGraph: {
    title: "PixelSmart Art | AI-Powered Pixel Art Generator",
    description: "Transform your images into stunning pixel art with smart color palettes and filters.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixelSmart Art",
    description: "Transform your images into stunning pixel art",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="animated-bg" />
        <div className="grid-overlay" />
        {children}
      </body>
    </html>
  );
}
