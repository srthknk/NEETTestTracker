# NEET Tracker - Full-Stack Preparation Tracking Application

A comprehensive, data-driven NEET exam preparation tracker built with Next.js, MongoDB, and Tailwind CSS.

## Features

### Core Features
- **Dashboard**: Real-time performance overview with Reality Check panel
- **Test Management**: Add, edit, and delete practice tests
- **Performance Analytics**: Detailed charts and trend analysis
- **Subject-wise Breakdown**: Track performance across Physics, Chemistry, Biology
- **Reports Generation**: Download comprehensive performance reports
- **Responsive Design**: Mobile-first, fully responsive interface
- **Premium UI**: Black & white minimalist theme with FontAwesome icons

### Dashboard Features
- Total tests attempted tracking
- Average and highest scores
- Overall accuracy percentage
- Subject-wise performance metrics
- Weekly/monthly trend analysis
- Recent tests overview
- Estimated AIR calculation

### Analytics Features
- Score trend over time
- Efficiency analysis (marks/minute vs accuracy)
- Subject performance comparison
- Test comparison mode
- Detailed statistics table

### Reports Features
- Overall performance reports
- Individual test reports
- Subject-wise breakdowns
- Download as text files

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas + Mongoose ODM
- **Charts**: Recharts
- **Icons**: FontAwesome SVG Icons
- **Authentication**: JWT-based with bcryptjs
- **State Management**: localStorage (can be extended with Zustand)
- **Deployment**: Vercel-ready

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication (login, signup)
│   │   ├── tests/               # Test CRUD operations
│   │   └── analytics/           # Analytics data
│   ├── dashboard/               # Dashboard pages
│   │   ├── tests/               # Tests management
│   │   ├── analytics/           # Analytics view
│   │   └── reports/             # Reports generation
│   ├── page.tsx                 # Login/Signup page
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── layout/                  # Layout components (Sidebar)
│   ├── dashboard/               # Dashboard components
│   ├── tests/                   # Test-related components
│   ├── analytics/               # Analytics components
│   └── reports/                 # Reports components
├── lib/                          # Utility functions
│   ├── dbConnect.ts             # MongoDB connection
│   └── auth.ts                  # JWT & password utilities
├── models/                       # MongoDB models
│   ├── User.ts
│   ├── Test.ts
│   ├── SubjectPerformance.ts
│   ├── MistakeLog.ts
│   └── AnalyticsSummary.ts
├── types/                        # TypeScript types
│   └── index.ts
└── styles/                       # Global styles
    └── globals.css
```

## Database Models

### User
- Email (unique)
- Password (hashed)
- Name
- Target Marks (default: 650)
- Created/Updated timestamps

### Test
- User ID (reference)
- Test Name
- Date
- Total Marks (out of 720)
- Marks Obtained
- Time Taken (minutes)
- Subjects Covered
- Syllabus Covered
- Tags (full-syllabus, part-test, pyq)
- Calculated Accuracy

### SubjectPerformance
- User ID, Test ID (references)
- Subject (Physics, Chemistry, Biology)
- Max Marks & Marks Obtained
- Accuracy, Attempted Questions, Correct Answers

### MistakeLog
- User ID, Test ID (references)
- Mistake Type (conceptual, silly, guessing)
- Marks Lost
- Description
- Subject

### AnalyticsSummary
- User ID (unique reference)
- Total Tests Attempted
- Average Score, Highest Score
- Overall Accuracy
- Subject-wise Performance
- Mistake Analysis
- Estimated AIR
- Last Updated timestamp

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account
- Git

### Local Development

1. **Clone or open the project**:
   ```bash
   cd "d:\Coding\NEET Tracker"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file (copy from `.env.example`):
   ```env
   NEXT_PUBLIC_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/neet_tracker?retryWrites=true&w=majority
   NEXTAUTH_SECRET=your_jwt_secret_key_change_this_in_production
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

5. **Login with demo credentials**:
   - Email: demo@example.com
   - Password: demo123

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account

### Tests
- `GET /api/tests` - Get all tests (paginated)
- `GET /api/tests/[id]` - Get specific test
- `POST /api/tests` - Create new test
- `PUT /api/tests/[id]` - Update test
- `DELETE /api/tests/[id]` - Delete test

### Analytics
- `GET /api/analytics/summary` - Get user analytics summary

## UI/UX Guidelines

### Color Scheme
- **Primary**: Black (#000000)
- **Background**: White (#ffffff)
- **Secondary Bg**: Light Gray (#f9f9f9)
- **Borders**: Light Gray (#e5e5e5)
- **Text Primary**: Black (#000000)
- **Text Secondary**: Dark Gray (#666666)
- **Text Tertiary**: Light Gray (#999999)

### Typography
- **Font**: Inter, Geist (sans-serif)
- **Headings**: Bold, larger font sizes
- **Body**: Regular weight, readable line height
- **Emphasis**: Semibold for important information

### Components
- Minimal card-based layout
- Thin borders (1px)
- No gradients or bright colors
- Subtle hover effects
- Smooth transitions (200ms)
- Rounded corners: 2px (minimal)

## Future Enhancements

1. **Mistake Tracking System**: Detailed tracking of conceptual, silly, and guessing-based mistakes
2. **AIR Estimation**: Historical data-based ranking prediction
3. **Test Comparison Mode**: Side-by-side test comparison
4. **Weekly Summaries**: Email-based performance updates
5. **Mobile App**: React Native version
6. **Multi-user Support**: Admin dashboard for collaborative tracking
7. **Advanced Analytics**: ML-based weak topic identification
8. **Collaboration Features**: Share progress with mentors/friends
9. **PDF Report Export**: Enhanced report generation with formatting
10. **Notification System**: Real-time performance alerts

## Authentication

Currently supports JWT-based authentication with:
- Email/Password signup and login
- Secure password hashing with bcryptjs
- 30-day token expiration
- Protected API routes via middleware

Can be extended with:
- NextAuth.js for social login
- Google/GitHub OAuth
- Email verification

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Add environment variables in Vercel dashboard
5. Click Deploy

### Environment Variables Required
```
NEXT_PUBLIC_MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL
```

## Performance Optimization

- Server-side rendering with Next.js App Router
- Optimized MongoDB queries with indexing
- Minimal API calls with efficient data fetching
- Chart lazy loading with Recharts
- Image optimization with Next.js Image
- CSS minification with Tailwind CSS

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Feel free to use this project

## Support

For issues or suggestions, please create an issue in the repository or contact support.

---

**Built with ❤️ for NEET aspirants**
