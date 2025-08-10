import { QuestionStatus, Tag } from '../types';

interface ForumFiltersProps {
  onStatusFilter: (status: QuestionStatus | 'all') => void;
  onTagFilter: (tag: string | null) => void;
  onSearchChange: (search: string) => void;
  selectedStatus: QuestionStatus | 'all';
  selectedTag: string | null;
  searchTerm: string;
  availableTags: Tag[];
  questionCounts: {
    total: number;
    open: number;
    claimed: number;
    resolved: number;
  };
}

export default function ForumFilters({
  onStatusFilter,
  onTagFilter,
  onSearchChange,
  selectedStatus,
  selectedTag,
  searchTerm,
  availableTags,
  questionCounts,
}: ForumFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Questions
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => onStatusFilter(e.target.value as QuestionStatus | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Questions ({questionCounts.total})</option>
            <option value="open">Open ({questionCounts.open})</option>
            <option value="claimed">Claimed ({questionCounts.claimed})</option>
            <option value="resolved">Resolved ({questionCounts.resolved})</option>
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tag
          </label>
          <select
            id="tag"
            value={selectedTag || ''}
            onChange={(e) => onTagFilter(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedStatus !== 'all' || selectedTag || searchTerm) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Status: {selectedStatus}
                <button
                  onClick={() => onStatusFilter('all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedTag && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Tag: {selectedTag}
                <button
                  onClick={() => onTagFilter(null)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Search: &quot;{searchTerm}&quot;
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={() => {
                onStatusFilter('all');
                onTagFilter(null);
                onSearchChange('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}