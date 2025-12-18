import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnerCompass Mini",
  description: "Your personal wellness companion for mindful reflection and clarity in just 60 seconds",
  themeColor: "#f5f2ed", // warm sand background
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
