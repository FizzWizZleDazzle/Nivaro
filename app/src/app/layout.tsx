import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "Nivaro - Complete Club Management Platform | Meetings, Collaboration & Learning",
  description: "Transform your club management with Nivaro. Streamline meetings, boost collaboration, enhance learning experiences, and build stronger communities. Join thousands of successful clubs worldwide.",
  keywords: "club management, community platform, meeting scheduler, project collaboration, learning platform, member engagement, team coordination",
  authors: [{ name: "Nivaro Team" }],
  creator: "Nivaro",
  publisher: "Nivaro",
  openGraph: {
    title: "Nivaro - Complete Club Management Platform",
    description: "Transform your club management with Nivaro. Streamline meetings, boost collaboration, enhance learning experiences, and build stronger communities.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nivaro - Complete Club Management Platform",
    description: "Transform your club management with Nivaro. Streamline meetings, boost collaboration, enhance learning experiences, and build stronger communities.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
