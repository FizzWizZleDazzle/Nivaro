// Server component wrapper for static export with dynamic routes
import MeetingDetailClient from './MeetingDetailClient';

// Generate one static page that handles all meeting IDs client-side
export async function generateStaticParams() {
  return [{ id: 'static' }];
}

export default function MeetingDetailPage() {
  return <MeetingDetailClient />;
}