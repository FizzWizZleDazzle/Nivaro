// Server component wrapper for static export with dynamic routes
import MembersClient from './MembersClient';

// Generate one static page that handles all club IDs client-side
export async function generateStaticParams() {
  return [{ clubId: 'static' }];
}

export default function MembersPage() {
  return <MembersClient />;
}