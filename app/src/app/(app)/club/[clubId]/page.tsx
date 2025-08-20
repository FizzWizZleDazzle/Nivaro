// Server component wrapper for static export with dynamic routes
import ClubDashboardClient from './ClubDashboardClient';

// Generate one static page that handles all club IDs client-side
export async function generateStaticParams() {
  return [{ clubId: 'static' }];
}

export default function ClubDashboard() {
  return <ClubDashboardClient />;
}