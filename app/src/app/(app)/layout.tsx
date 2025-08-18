import React from 'react';
import { Metadata } from 'next';
import Navigation from '../../components/Navigation';
import ErrorBoundary from '../../components/ErrorBoundary';
import ClientWrapper from '../../components/ClientWrapper';

export const metadata: Metadata = {
  title: "Dashboard - Nivaro",
  description: "Your club management dashboard",
  robots: {
    index: false,  // Don't index authenticated pages
    follow: false,
  },
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Prevent indexing of authenticated app pages */}
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Basic app meta */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-gray-50">
        <ErrorBoundary>
          <ClientWrapper>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </ClientWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}