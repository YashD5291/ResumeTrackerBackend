# Resume Tracker Backend API

A comprehensive backend API for the Resume Tracker browser extension, built with Next.js 14, MongoDB Atlas, and deployed on Vercel.

## Features

- **User Authentication**: JWT-based authentication with support for anonymous and registered users
- **Application Tracking**: Full CRUD operations for job applications with status tracking
- **Resume Management**: Upload, store, and manage PDF resumes with metadata extraction
- **Advanced Search**: Full-text search across applications with filtering capabilities
- **Analytics Dashboard**: Comprehensive analytics including application trends and success rates
- **Data Export**: Export data to CSV and JSON formats
- **Sync API**: Real-time synchronization for browser extension
- **MongoDB Atlas**: Scalable cloud database with proper indexing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcryptjs
- **File Handling**: Native Next.js with base64 encoding
- **Validation**: Zod schemas
- **Deployment**: Vercel

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ResumeTrackerBackend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your MongoDB URI and secrets:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your-super-secure-jwt-secret
   NEXTAUTH_SECRET=your-nextauth-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Visit** http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/preferences` - Update user preferences

### Applications
- `GET /api/applications` - List applications with filters
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get specific application
- `PUT /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application
- `POST /api/applications/batch` - Batch operations

### Resumes
- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Upload new resume
- `GET /api/resumes/[id]` - Get resume metadata
- `PUT /api/resumes/[id]` - Update resume
- `DELETE /api/resumes/[id]` - Delete resume
- `GET /api/resumes/[id]/pdf` - Download PDF

### Search & Analytics
- `GET /api/search` - Search applications
- `GET /api/analytics` - Dashboard analytics
- `GET /api/export/csv` - Export to CSV
- `GET /api/export/json` - Export to JSON

### Sync (Extension)
- `POST /api/sync/push` - Push local changes
- `GET /api/sync/pull` - Pull server changes
- `GET /api/sync/status` - Check sync status

## Data Models

### User
- `userId`: Unique identifier
- `email`: Optional email for registered users
- `preferences`: User settings
- `createdAt`: Registration timestamp

### Application
- `id`: Unique application identifier
- `url`: Job posting URL
- `companyName`: Company name
- `jobTitle`: Job title
- `status`: Application status (Applied, Interview, Rejected, etc.)
- `dateApplied`: Application date
- `statusHistory`: Status change history
- `tags`: Custom tags
- `salary`: Salary information
- `location`: Job location details

### Resume
- `id`: Unique resume identifier
- `name`: Resume name
- `filename`: Original filename
- `pdfData`: Base64 encoded PDF
- `metadata`: Extracted text and keywords
- `fileSize`: File size in bytes

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer <jwt_token>" \
  https://your-api.vercel.app/api/applications
```

## Deployment

### Vercel Deployment

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Import project in Vercel dashboard

2. **Environment Variables**
   Set in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET` 
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Deploy**
   ```bash
   npm run build
   vercel deploy --prod
   ```

### MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP addresses (or use 0.0.0.0/0 for development)
4. Get connection string

## Browser Extension Integration

The API is designed to work seamlessly with the Resume Tracker browser extension:

1. **Authentication**: Extension can create anonymous users or register with email
2. **Real-time Sync**: Push/pull API keeps extension and cloud data synchronized
3. **Conflict Resolution**: Handles data conflicts between local and server changes
4. **Offline Support**: Extension works offline, syncs when online

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Input Validation**: Zod schemas validate all inputs
- **CORS Configuration**: Proper CORS headers for extension communication
- **Rate Limiting**: Can be added via Vercel Edge Config
- **Data Encryption**: Sensitive data encrypted at rest in MongoDB

## Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Cursor-based pagination for large datasets
- **Aggregation Pipelines**: Efficient analytics queries
- **Connection Pooling**: MongoDB connection reuse
- **Edge Functions**: Vercel edge runtime for faster responses

## Monitoring & Analytics

- **Error Tracking**: Console logging with error context
- **Performance Metrics**: Response time monitoring
- **Usage Analytics**: Track API endpoint usage
- **Database Monitoring**: MongoDB Atlas monitoring

## Development

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

### API Testing
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Create application
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/job",
    "site": "Example Jobs",
    "companyName": "Example Corp",
    "jobTitle": "Software Engineer"
  }'
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please open an issue on GitHub or contact the development team.