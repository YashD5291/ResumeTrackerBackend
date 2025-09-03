import Link from 'next/link'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Resume Tracker API
        </h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
          <p className="text-gray-600 mb-4">
            This is the backend API for the Resume Tracker browser extension. 
            It provides endpoints for managing job applications, resumes, and user data.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Authentication</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>POST /api/auth/register</li>
                <li>POST /api/auth/login</li>
                <li>GET /api/auth/me</li>
                <li>PUT /api/auth/preferences</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Applications</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>GET /api/applications</li>
                <li>POST /api/applications</li>
                <li>GET /api/applications/[id]</li>
                <li>PUT /api/applications/[id]</li>
                <li>DELETE /api/applications/[id]</li>
                <li>POST /api/applications/batch</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Resumes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>GET /api/resumes</li>
                <li>POST /api/resumes</li>
                <li>GET /api/resumes/[id]</li>
                <li>PUT /api/resumes/[id]</li>
                <li>DELETE /api/resumes/[id]</li>
                <li>GET /api/resumes/[id]/pdf</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Analytics & Search</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>GET /api/search</li>
                <li>GET /api/analytics</li>
                <li>GET /api/export/csv</li>
                <li>GET /api/export/json</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Sync (Extension)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>POST /api/sync/push</li>
                <li>GET /api/sync/pull</li>
                <li>GET /api/sync/status</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500">
            Built with Next.js, MongoDB Atlas, and deployed on Vercel
          </p>
        </div>
      </div>
    </main>
  )
}