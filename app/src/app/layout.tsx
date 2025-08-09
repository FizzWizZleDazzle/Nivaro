import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nivaro - Help & Mentorship Platform",
  description: "A platform for student help and mentorship",
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
