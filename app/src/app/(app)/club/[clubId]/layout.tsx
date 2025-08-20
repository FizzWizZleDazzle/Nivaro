// Server component wrapper for static export with dynamic routes
import { ReactNode } from 'react';
import ClubLayoutClient from './ClubLayoutClient';

// Generate one static page that handles all club IDs client-side
export async function generateStaticParams() {
  return [{ clubId: 'static' }];
}

export default function ClubLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <ClubLayoutClient>
      {children}
    </ClubLayoutClient>
  );
}