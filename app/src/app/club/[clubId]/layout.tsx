'use client';

import { ReactNode, use } from 'react';
import ClubNavigation from '../../../components/ClubNavigation';

export default function ClubLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ClubNavigation clubId={clubId} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}