'use client';

import { ReactNode, use } from 'react';
import ClubNavigation from '../../../../components/ClubNavigation';
import { useParams } from 'next/navigation';

export default function ClubLayoutClient({
  children
}: {
  children: ReactNode;
}) {
  const params = useParams();
  const clubId = params.clubId as string;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ClubNavigation clubId={clubId} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}