'use client'

import { Resume, Application } from '../types'

interface ResumesTabProps {
  resumes: Resume[]
  applications: Application[]
  onUploadResume: () => void
  onViewResume: (resumeId: string, filename: string) => Promise<void>
  onDownloadResume: (resumeId: string, filename: string) => Promise<void>
  onDeleteResume: (resumeId: string) => Promise<void>
}

export default function ResumesTab({
  resumes,
  applications,
  onUploadResume,
  onViewResume,
  onDownloadResume,
  onDeleteResume
}: ResumesTabProps) {
  // Get resume usage statistics
  const getResumeStats = (resumeId: string) => {
    const usageCount = applications.filter(app => app.resumeId === resumeId).length
    const successfulApps = applications.filter(
      app => app.resumeId === resumeId && ['Interview', 'Offer', 'Accepted'].includes(app.status)
    ).length
    const successRate = usageCount > 0 ? ((successfulApps / usageCount) * 100).toFixed(1) : '0'
    return { usageCount, successfulApps, successRate }
  }

  return (
    <div className="space-y-6">
      {/* Upload Resume Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Resume Management</h2>
        <button
          onClick={onUploadResume}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          + Upload Resume
        </button>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">Upload your resumes to track which ones perform best.</p>
          <button
            onClick={onUploadResume}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Upload Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => {
            const stats = getResumeStats(resume.id)
            
            return (
              <div key={resume.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-4">
                  <div className="flex items-start mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-medium text-gray-900">{resume.name}</h4>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-sm text-gray-600 font-mono break-all">{resume.filename}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Used in applications:</span>
                    <span className="font-medium text-gray-900">{stats.usageCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Successful applications:</span>
                    <span className="font-medium text-green-600">{stats.successfulApps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success rate:</span>
                    <span className="font-medium text-indigo-600">{stats.successRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">File size:</span>
                    <span className="text-gray-600">{(resume.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Uploaded:</span>
                    <span className="text-gray-600">{new Date(resume.dateAdded).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewResume(resume.id, resume.filename)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition font-medium flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => onDownloadResume(resume.id, resume.filename)}
                    className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => onDeleteResume(resume.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}