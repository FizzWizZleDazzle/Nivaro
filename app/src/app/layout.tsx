import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nivaro - Club Management Platform",
  description: "A platform for managing clubs and member communities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
