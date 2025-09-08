'use client'

import { useState } from 'react'
import { Application, Resume, COLORS } from '../types'

interface ApplicationsTabProps {
  applications: Application[]
  resumes: Resume[]
  onUpdateStatus: (id: string, status: string) => Promise<void>
  onDeleteApplication: (id: string) => Promise<void>
  onExportData: (format: 'csv' | 'json') => Promise<void>
  onAddApplication: () => void
  onViewResume: (resumeId: string, filename: string) => Promise<void>
  onDownloadResume: (resumeId: string, filename: string) => Promise<void>
}

export default function ApplicationsTab({
  applications,
  resumes,
  onUpdateStatus,
  onDeleteApplication,
  onExportData,
  onAddApplication,
  onViewResume,
  onDownloadResume
}: ApplicationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dateApplied')

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.resumeName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'dateApplied') {
      return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    }
    if (sortBy === 'company') {
      return a.companyName.localeCompare(b.companyName)
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status)
    }
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search applications or resumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {Object.keys(COLORS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dateApplied">Date Applied</option>
            <option value="company">Company Name</option>
            <option value="status">Status</option>
          </select>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onAddApplication}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Add Application
          </button>
          
          <button
            onClick={() => onExportData('csv')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Applications Table with Resume Info */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new application.</p>
            <button
              onClick={onAddApplication}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.companyName}</div>
                        <div className="text-sm text-gray-500">{app.site}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.jobTitle}</div>
                      {app.salary?.amount && (
                        <div className="text-sm text-gray-500">
                          ${app.salary.amount.toLocaleString()} {app.salary.type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {app.resumeId ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-indigo-600 font-medium">
                            {app.resumeName || 'Resume'}
                          </span>
                          <button
                            onClick={() => {
                              if (app.resumeId) {
                                onViewResume(app.resumeId, app.resumeFilename || 'resume.pdf')
                              }
                            }}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="View Resume"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => app.resumeId && onDownloadResume(app.resumeId, app.resumeFilename || 'resume.pdf')}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Download Resume"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 font-medium border-0 cursor-pointer ${
                          app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'Interview' ? 'bg-yellow-100 text-yellow-700' :
                          app.status === 'Offer' ? 'bg-purple-100 text-purple-700' :
                          app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {Object.keys(COLORS).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}