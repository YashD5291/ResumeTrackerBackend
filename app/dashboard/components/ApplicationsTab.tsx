'use client'

import { useState, useEffect, useRef } from 'react'
import { Application, Resume, COLORS } from '../types'
import { PaginationState, ApplicationFilters } from '../hooks/useDashboardData'

// Simple tooltip component for notes
function NoteTooltip({ note, children }: { note: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 300)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShow(false)
  }

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal">
          {note}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  )
}

interface ApplicationsTabProps {
  applications: Application[]
  resumes: Resume[]
  pagination: PaginationState
  filters: ApplicationFilters
  isLoading: boolean
  onUpdateStatus: (id: string, status: string) => Promise<void>
  onDeleteApplication: (id: string) => Promise<void>
  onExportData: (format: 'csv' | 'json') => Promise<void>
  onAddApplication: () => void
  onViewResume: (resumeId: string, filename: string) => Promise<void>
  onDownloadResume: (resumeId: string, filename: string) => Promise<void>
  onPageChange: (page: number) => void
  onFiltersChange: (filters: Partial<ApplicationFilters>) => void
}

export default function ApplicationsTab({
  applications,
  resumes,
  pagination,
  filters,
  isLoading,
  onUpdateStatus,
  onDeleteApplication,
  onExportData,
  onAddApplication,
  onViewResume,
  onDownloadResume,
  onPageChange,
  onFiltersChange
}: ApplicationsTabProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ search: searchTerm })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, filters.search, onFiltersChange])

  const handleStatusFilter = (status: string) => {
    onFiltersChange({ status })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy })
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const { currentPage, totalPages } = pagination

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 w-full sm:w-64"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Status</option>
            {Object.keys(COLORS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 cursor-pointer"
          >
            <option value="dateApplied">Date Applied</option>
            <option value="companyName">Company Name</option>
            <option value="status">Status</option>
          </select>
        </div>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={onAddApplication}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Application</span>
          </button>

          <button
            onClick={() => onExportData('csv')}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm sm:text-base"
            title="Export to CSV"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {applications.length > 0 ? ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1 : 0}
          -{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} applications
        </span>
        {isLoading && (
          <span className="flex items-center gap-2 text-slate-500">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle cx="25" cy="25" r="20" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeDasharray="80, 200" />
            </svg>
            Loading...
          </span>
        )}
      </div>

      {/* Applications Table with Resume Info */}
      <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/60 transition-opacity duration-200 ${isLoading ? 'opacity-60' : ''}`}>
        {applications.length === 0 && !isLoading ? (
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
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{app.companyName}</div>
                          <div className="text-xs text-slate-500">{app.site}</div>
                        </div>
                        {app.notes && (
                          <NoteTooltip note={app.notes}>
                            <div className="flex-shrink-0 w-5 h-5 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center cursor-help">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                          </NoteTooltip>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{app.jobTitle}</div>
                      {app.salary?.amount && (
                        <div className="text-xs text-slate-500">
                          ${app.salary.amount.toLocaleString()} {app.salary.type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const resume = app.resumeId ? resumes.find(r => r.id === app.resumeId) : null
                        if (resume) {
                          return (
                            <button
                              onClick={() => onViewResume(resume.id, resume.filename || 'resume.pdf')}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                              title="Click to view resume"
                            >
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {resume.name}
                            </button>
                          )
                        }
                        return <span className="text-xs text-slate-400">—</span>
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                        className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border-0 cursor-pointer transition-colors ${
                          app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'Interview' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'Offer' ? 'bg-purple-100 text-purple-700' :
                          app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {Object.keys(COLORS).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                          title="View job posting"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open
                        </a>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete application"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    className={`w-10 h-10 text-sm font-medium rounded-xl transition-all duration-200 ${
                      page === pagination.currentPage
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 text-slate-400">...</span>
                )
              ))}
            </div>

            <span className="sm:hidden text-sm text-slate-600 font-medium">
              {pagination.currentPage} / {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:block text-sm text-slate-500">
            Page <span className="font-medium text-slate-700">{pagination.currentPage}</span> of <span className="font-medium text-slate-700">{pagination.totalPages}</span>
          </div>
        </div>
      )}
    </div>
  )
}