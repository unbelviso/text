import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TextStamp — Turn any font into a PNG in seconds",
  description:
    "Type a phrase, pick a font (or upload your own), and export a transparent PNG or SVG. Built for Etsy sellers, designers, and social media makers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
