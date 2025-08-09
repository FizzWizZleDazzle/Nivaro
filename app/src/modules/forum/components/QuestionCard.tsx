import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClaim?: (questionId: string) => void;
  onResolve?: (questionId: string) => void;
  currentUser: string;
}

export default function QuestionCard({ question, onClaim, onResolve, currentUser }: QuestionCardProps) {
  const getStatusBadge = (status: Question['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Open</span>;
      case 'claimed':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Claimed</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Resolved</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Less than an hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
    }
  };

  const canClaim = question.status === 'open' && currentUser !== question.author;
  const canResolve = question.status === 'claimed' && currentUser === question.author;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{question.title}</h3>
        {getStatusBadge(question.status)}
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{question.content}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <span>Asked by <strong>{question.author}</strong></span>
          <span className="mx-2">•</span>
          <span>{formatDate(question.createdAt)}</span>
          {question.claimedBy && (
            <>
              <span className="mx-2">•</span>
              <span>Claimed by <strong>{question.claimedBy}</strong></span>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          {canClaim && onClaim && (
            <button
              onClick={() => onClaim(question.id)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Claim to Answer
            </button>
          )}
          {canResolve && onResolve && (
            <button
              onClick={() => onResolve(question.id)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}