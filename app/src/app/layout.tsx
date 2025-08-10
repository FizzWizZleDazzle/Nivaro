import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ClientWrapper from "@/components/ClientWrapper";

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
      <body className="font-sans antialiased">
        <ClientWrapper>
          <Navigation />
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
