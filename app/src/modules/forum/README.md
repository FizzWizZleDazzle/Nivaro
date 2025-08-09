# Help & Mentorship Forum Module

A modular forum system for Nivaro that allows students to ask questions and get help from mentors.

## Features

### ✅ Implemented
- **Structured Question Posting**: Users can post questions with titles, descriptions, and topic tags
- **Topic Tagging System**: Questions can be tagged with relevant topics (JavaScript, React, TypeScript, CSS, Career, Algorithms)
- **Question Claiming**: Mentors can claim questions to indicate they will provide help
- **Resolution Marking**: Question authors can mark their questions as resolved once answered
- **Advanced Filtering**: Filter questions by status (open/claimed/resolved), tags, and search text
- **Real-time Statistics**: Display counts of total, open, claimed, and resolved questions
- **Responsive UI**: Clean, mobile-friendly interface built with TailwindCSS

### Core Components

#### Frontend (`/src/modules/forum/`)
- **ForumPage**: Main forum interface with question listing and form
- **QuestionCard**: Individual question display with actions
- **QuestionForm**: Form for creating new questions
- **ForumFilters**: Search and filtering controls
- **useForum**: Custom hook managing forum state and actions

#### Backend (`/backend/src/forum.rs`)
- **API Endpoints**: 
  - `GET /api/forum/questions` - List all questions
  - `POST /api/forum/questions` - Create new question
  - `PUT /api/forum/questions/:id/claim` - Claim a question
  - `PUT /api/forum/questions/:id/resolve` - Mark question as resolved
  - `GET /api/forum/tags` - Get available tags

### Question Lifecycle
1. **Open**: Question is posted and available for claiming
2. **Claimed**: A mentor has claimed the question and is working on an answer
3. **Resolved**: The question author has marked the question as answered

### Data Types
```typescript
interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  status: 'open' | 'claimed' | 'resolved';
  claimedBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
```

## Architecture

### Modular Design
The forum is implemented as a self-contained module to avoid conflicts with future club and project modules:

```
src/modules/forum/
├── components/     # React components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── types/         # TypeScript interfaces
├── utils/         # Utility functions
└── index.ts       # Module exports
```

### State Management
- Uses React hooks (useState, useMemo, useCallback) for local state
- Custom `useForum` hook encapsulates all forum logic
- Mock data for development, ready for backend integration

### Styling
- TailwindCSS for responsive design
- Consistent color coding for question status
- Accessible form controls and navigation

## Usage

### Running the Forum
```bash
# Frontend
cd app
npm install
npm run dev

# Backend (optional)
cd backend
cargo check
```

### Adding New Features
1. Add types to `/src/modules/forum/types/index.ts`
2. Create components in `/src/modules/forum/components/`
3. Update the `useForum` hook for state management
4. Add backend endpoints in `/backend/src/forum.rs`

### Integration with Other Modules
The forum module is designed to be imported cleanly:

```typescript
import { ForumPage, useForum } from '../modules/forum';
```

## Development Status

### Current State
- ✅ Full frontend implementation with mock data
- ✅ Basic backend API structure
- ✅ Responsive UI with TailwindCSS
- ✅ TypeScript type safety
- ✅ Modular architecture

### Future Enhancements
- [ ] Real database integration (PostgreSQL, MongoDB, etc.)
- [ ] User authentication and authorization
- [ ] Question voting/rating system
- [ ] Comment/reply threads
- [ ] Email notifications
- [ ] Advanced search with full-text indexing
- [ ] File attachments for questions
- [ ] User reputation system
- [ ] Question categories/subcategories

## Testing

The forum has been manually tested for:
- ✅ Question creation with title, content, and tags
- ✅ Question claiming by mentors
- ✅ Question resolution by authors
- ✅ Filtering by status, tags, and search terms
- ✅ Real-time statistics updates
- ✅ Responsive design on different screen sizes

## Contributing

When contributing to the forum module:
1. Follow the existing component structure
2. Add TypeScript types for new features
3. Update mock data as needed for testing
4. Ensure responsive design compliance
5. Test all user interactions manually