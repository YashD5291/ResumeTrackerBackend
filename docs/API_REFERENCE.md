# Resume Tracker API Reference

**Production URL**: `https://resume-tracker-backend.vercel.app`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body (Optional):**
```json
{
  "email": "user@example.com",     // Optional
  "password": "yourpassword"       // Optional
}
```

**Response:**
```json
{
  "user": {
    "userId": "user_1234567890_abc123",
    "email": "user@example.com",
    "preferences": {
      "autoDetect": true,
      "defaultStatus": "Applied",
      "emailNotifications": false
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:** Same as register

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "userId": "user_1234567890_abc123",
    "email": "user@example.com",
    "preferences": {
      "autoDetect": true,
      "defaultStatus": "Applied",
      "emailNotifications": false
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastActive": "2025-01-01T12:00:00.000Z"
  }
}
```

### Update Preferences
```http
PUT /api/auth/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "autoDetect": false,
  "defaultStatus": "Interview",
  "emailNotifications": true
}
```

---

## 📋 Application Endpoints

### Get Applications
```http
GET /api/applications
Authorization: Bearer <token>

# Query Parameters:
?status=Applied
?company=Google
?tags=remote,fulltime
?limit=50
?offset=0
?sortBy=dateApplied
?order=desc
```

**Response:**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user_1234567890_abc123",
      "id": "app_1234567890_xyz789",
      "url": "https://jobs.company.com/123",
      "site": "company.com",
      "companyName": "Tech Corp",
      "jobTitle": "Software Engineer",
      "resumeId": "resume_123_abc",
      "resumeName": "My Resume",
      "resumeFilename": "resume.pdf",
      "status": "Applied",
      "tags": ["remote", "fulltime"],
      "dateApplied": "2025-01-01T00:00:00.000Z",
      "dateCreated": "2025-01-01T00:00:00.000Z",
      "lastUpdated": "2025-01-01T00:00:00.000Z",
      "notes": "Looks like a great opportunity",
      "statusHistory": [
        {
          "status": "Applied",
          "date": "2025-01-01T00:00:00.000Z",
          "notes": "Initial application"
        }
      ],
      "salary": {
        "amount": 120000,
        "currency": "USD",
        "type": "annual"
      },
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "remote": true
      },
      "applicationSource": "extension"
    }
  ],
  "total": 45,
  "hasMore": true
}
```

### Create Application
```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://jobs.company.com/123",
  "site": "company.com",
  "companyName": "Tech Corp",
  "jobTitle": "Software Engineer",
  "resumeId": "resume_123_abc",           // Optional
  "resumeName": "My Resume",             // Optional
  "resumeFilename": "resume.pdf",        // Optional
  "status": "Applied",                   // Optional, defaults to "Applied"
  "tags": ["remote", "fulltime"],       // Optional
  "dateApplied": "2025-01-01T00:00:00.000Z", // Optional, defaults to now
  "notes": "Great opportunity",          // Optional
  "salary": {                           // Optional
    "amount": 120000,
    "currency": "USD",
    "type": "annual"
  },
  "location": {                         // Optional
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "remote": true
  }
}
```

### Get Single Application
```http
GET /api/applications/{id}
Authorization: Bearer <token>
```

### Update Application
```http
PUT /api/applications/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** Same fields as create (all optional)

### Delete Application
```http
DELETE /api/applications/{id}
Authorization: Bearer <token>
```

### Batch Operations
```http
POST /api/applications/batch
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "applications": [
    {
      "id": "app_existing_123",    // If provided, updates existing
      "url": "https://...",
      "companyName": "...",
      // ... other fields
    },
    {
      // New application (no id field)
      "url": "https://...",
      "companyName": "...",
      // ... other fields  
    }
  ]
}
```

**Response:**
```json
{
  "success": 2,
  "errorCount": 0,
  "results": [
    {
      "action": "updated",
      "application": { /* application object */ }
    },
    {
      "action": "created", 
      "application": { /* application object */ }
    }
  ],
  "errors": []
}
```

---

## 📄 Resume Endpoints

### Get Resumes
```http
GET /api/resumes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "resumes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user_1234567890_abc123",
      "id": "resume_1234567890_xyz789",
      "name": "Software Engineer Resume",
      "filename": "resume.pdf",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "dateAdded": "2025-01-01T00:00:00.000Z",
      "lastModified": "2025-01-01T00:00:00.000Z",
      "isActive": true,
      "metadata": {
        "pages": 2,
        "keywords": ["JavaScript", "React", "Node.js"],
        "extractedText": "John Doe Software Engineer..."
      }
    }
  ]
}
```

### Upload Resume
```http
POST /api/resumes
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
pdf: <file>                    // Required: PDF file
name: "My Resume"              // Required: Resume name
filename: "resume.pdf"         // Required: Original filename
```

### Get Resume Details
```http
GET /api/resumes/{id}
Authorization: Bearer <token>
```

### Update Resume
```http
PUT /api/resumes/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Resume Name",
  "keywords": ["Python", "Django", "SQL"],
  "extractedText": "Updated extracted text..."
}
```

### Download Resume PDF
```http
GET /api/resumes/{id}/pdf
Authorization: Bearer <token>
```

**Response:** Binary PDF file

### Delete Resume
```http
DELETE /api/resumes/{id}
Authorization: Bearer <token>
```

---

## 🔍 Search & Analytics

### Search Applications
```http
GET /api/search
Authorization: Bearer <token>

# Query Parameters:
?q=software engineer          // Search term
?status=Applied              // Filter by status
?tags=remote,fulltime        // Filter by tags
?company=Google              // Filter by company
?dateFrom=2025-01-01         // Date range start
?dateTo=2025-12-31           // Date range end
?limit=50                    // Results limit
?offset=0                    // Pagination offset
```

**Response:**
```json
{
  "applications": [ /* array of applications */ ],
  "total": 25,
  "hasMore": false,
  "query": {
    "searchTerm": "software engineer",
    "status": "Applied",
    "tags": ["remote", "fulltime"],
    "dateFrom": "2025-01-01",
    "dateTo": "2025-12-31",
    "companyName": "Google"
  }
}
```

### Get Analytics
```http
GET /api/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "overview": {
    "totalApplications": 150,
    "recentApplications": 25,
    "totalResumes": 3,
    "responseRate": 12.5,
    "successRate": 8.0
  },
  "statusDistribution": {
    "Applied": 80,
    "Interview": 20,
    "Rejected": 35,
    "Offer": 5,
    "Accepted": 10,
    "Withdrawn": 0,
    "Pending": 0
  },
  "monthlyTrends": [
    {
      "_id": { "year": 2025, "month": 1 },
      "count": 25
    }
  ],
  "topCompanies": [
    {
      "_id": "Google",
      "count": 15
    }
  ],
  "averageResponseTime": 14
}
```

---

## 📤 Export Endpoints

### Export to CSV
```http
GET /api/export/csv
Authorization: Bearer <token>
```

**Response:** CSV file download

### Export to JSON
```http
GET /api/export/json
Authorization: Bearer <token>
```

**Response:** JSON file download with all user data

---

## 🔄 Sync Endpoints (For Browser Extension)

### Push Changes to Server
```http
POST /api/sync/push
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "applications": [ /* array of applications */ ],
  "resumes": [ /* array of resumes */ ],
  "lastSyncTimestamp": "2025-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "syncTimestamp": "2025-01-01T12:00:00.000Z",
  "results": {
    "applications": {
      "created": 5,
      "updated": 3,
      "conflicts": []
    },
    "resumes": {
      "created": 1,
      "updated": 0,
      "conflicts": []
    }
  }
}
```

### Pull Changes from Server
```http
GET /api/sync/pull
Authorization: Bearer <token>

# Query Parameters:
?lastSync=2025-01-01T00:00:00.000Z
```

**Response:**
```json
{
  "success": true,
  "syncTimestamp": "2025-01-01T12:00:00.000Z",
  "data": {
    "applications": [ /* array of applications */ ],
    "resumes": [ /* array of resumes */ ]
  },
  "hasChanges": true
}
```

### Get Sync Status
```http
GET /api/sync/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": {
    "userId": "user_1234567890_abc123",
    "lastActive": "2025-01-01T11:30:00.000Z",
    "lastDataUpdate": "2025-01-01T12:00:00.000Z",
    "counts": {
      "applications": 150,
      "resumes": 3
    },
    "serverTime": "2025-01-01T12:00:00.000Z"
  }
}
```

---

## 📝 Application Status Values

Valid status values for applications:
- `Applied`
- `Interview` 
- `Rejected`
- `Offer`
- `Accepted`
- `Withdrawn`
- `Pending`

## 💰 Salary Types

Valid salary types:
- `hourly`
- `annual` 
- `monthly`
- `weekly`

## 🌍 Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## 🚀 Quick Start

1. **Register a user:**
   ```bash
   curl -X POST https://resume-tracker-backend.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

2. **Create an application:**
   ```bash
   curl -X POST https://resume-tracker-backend.vercel.app/api/applications \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://jobs.example.com/123",
       "site": "example.com", 
       "companyName": "Example Corp",
       "jobTitle": "Software Engineer"
     }'
   ```

3. **Get applications:**
   ```bash
   curl -X GET https://resume-tracker-backend.vercel.app/api/applications \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

That's it! Your Resume Tracker API is ready to use.