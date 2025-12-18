import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnerCompass Mini",
  description: "A lightweight journaling app for quick reflections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
