import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Nivaro",
  description: "Complete club management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        <ErrorBoundary>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}