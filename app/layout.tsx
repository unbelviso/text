import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Font Image Maker",
  description: "Create beautiful text images with any font.",
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
