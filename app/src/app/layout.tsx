import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nivaro - Club Management Platform",
  description: "Project and code collaboration tools for technical clubs",
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
