'use client'

import { useState, useEffect } from 'react'
import { useDashboardData } from './hooks/useDashboardData'

// Components
import AuthForm from './components/AuthForm'
import DashboardHeader from './components/DashboardHeader'
import OverviewTab from './components/OverviewTab'
import ApplicationsTab from './components/ApplicationsTab'
import ResumesTab from './components/ResumesTab'
import AnalyticsTab from './components/AnalyticsTab'
import PDFViewerModal from './components/PDFViewerModal'
import AddApplicationModal from './components/AddApplicationModal'
import UploadResumeModal from './components/UploadResumeModal'

export default function Dashboard() {
  const {
    // State
    user,
    applications,
    resumes,
    analytics,
    loading,
    applicationsLoading,
    analyticsLoading,
    error,
    setError,

    // Pagination
    pagination,
    filters,
    goToPage,
    updateFilters,

    // Lazy loaders
    loadAnalytics,

    // Actions
    handleAuth,
    uploadResume,
    viewResume,
    downloadResume,
    deleteResume,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    exportData,
    logout
  } = useDashboardData()

  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'resumes' | 'analytics'>('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)

  // Undo state for delete operations
  const [pendingDelete, setPendingDelete] = useState<{id: string, type: 'application' | 'resume', data: any} | null>(null)
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null)

  // Lazy load analytics when viewing overview or analytics tab
  useEffect(() => {
    if ((activeTab === 'overview' || activeTab === 'analytics') && user) {
      loadAnalytics()
    }
  }, [activeTab, user, loadAnalytics])
  
  // PDF Viewer State
  const [viewingResumeUrl, setViewingResumeUrl] = useState<string | null>(null)
  const [viewingResumeFilename, setViewingResumeFilename] = useState<string>('')
  const [viewingResumeId, setViewingResumeId] = useState<string | null>(null)

  // Handle view resume
  const handleViewResume = async (resumeId: string, filename: string) => {
    const result = await viewResume(resumeId, filename)
    if (result) {
      setViewingResumeId(resumeId)
      setViewingResumeFilename(result.filename)
      setViewingResumeUrl(result.url)
    }
  }

  // Handle close PDF viewer
  const handleClosePDFViewer = () => {
    if (viewingResumeUrl) {
      URL.revokeObjectURL(viewingResumeUrl)
    }
    setViewingResumeId(null)
    setViewingResumeFilename('')
    setViewingResumeUrl(null)
  }

  // Handle download from PDF viewer
  const handleDownloadFromViewer = () => {
    if (viewingResumeId && viewingResumeFilename) {
      downloadResume(viewingResumeId, viewingResumeFilename)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    await uploadResume(file)
  }

  // Handle create application
  const handleCreateApplication = async (newApp: any) => {
    await createApplication(newApp)
    setShowAddModal(false)
  }

  // Handle global search
  const handleGlobalSearch = (query: string) => {
    updateFilters({ search: query })
    if (query && activeTab !== 'applications') {
      setActiveTab('applications')
    }
  }

  // Handle delete with undo
  const handleDeleteApplicationWithUndo = async (id: string) => {
    // Find the application to delete
    const appToDelete = applications.find(app => app.id === id)
    if (!appToDelete) return

    // Clear any existing undo timer
    if (undoTimer) {
      clearTimeout(undoTimer)
    }

    // Show undo toast
    setPendingDelete({ id, type: 'application', data: appToDelete })

    // Set timer to actually delete after 5 seconds
    const timer = setTimeout(async () => {
      await deleteApplication(id)
      setPendingDelete(null)
      setUndoTimer(null)
    }, 5000)
    setUndoTimer(timer)
  }

  // Handle undo
  const handleUndo = () => {
    if (!pendingDelete || !undoTimer) return

    // Clear the timer - this cancels the deletion
    clearTimeout(undoTimer)
    setUndoTimer(null)
    setPendingDelete(null)
  }

  // Handle close undo toast (proceeds with deletion immediately)
  const handleCloseUndo = async () => {
    if (!pendingDelete) return

    // Clear the timer
    if (undoTimer) {
      clearTimeout(undoTimer)
      setUndoTimer(null)
    }

    // Proceed with deletion immediately
    await deleteApplication(pendingDelete.id)
    setPendingDelete(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto animate-spin" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="5"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="80, 200"
              strokeDashoffset="0"
            />
          </svg>
          <p className="mt-6 text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} error={error} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <DashboardHeader
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resumeCount={resumes.length}
        onLogout={logout}
        onSearch={handleGlobalSearch}
        searchQuery={filters.search}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab
            analytics={analytics}
            applications={applications}
            resumes={resumes}
            analyticsLoading={analyticsLoading}
            onNavigate={setActiveTab}
          />
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <ApplicationsTab
            applications={applications.filter(app => pendingDelete?.id !== app.id)}
            resumes={resumes}
            pagination={pagination}
            filters={filters}
            isLoading={applicationsLoading}
            onUpdateStatus={updateApplicationStatus}
            onDeleteApplication={handleDeleteApplicationWithUndo}
            onExportData={exportData}
            onAddApplication={() => setShowAddModal(true)}
            onViewResume={handleViewResume}
            onDownloadResume={downloadResume}
            onPageChange={goToPage}
            onFiltersChange={updateFilters}
          />
        )}

        {/* Resumes Tab */}
        {activeTab === 'resumes' && (
          <ResumesTab
            resumes={resumes}
            applications={applications}
            onUploadResume={() => setShowResumeModal(true)}
            onViewResume={handleViewResume}
            onDownloadResume={downloadResume}
            onDeleteResume={deleteResume}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            analytics={analytics}
            resumes={resumes}
            applications={applications}
          />
        )}
      </div>

      {/* Modals */}
      <PDFViewerModal
        isOpen={!!viewingResumeUrl}
        resumeUrl={viewingResumeUrl}
        filename={viewingResumeFilename}
        onClose={handleClosePDFViewer}
        onDownload={handleDownloadFromViewer}
      />

      <AddApplicationModal
        isOpen={showAddModal}
        resumes={resumes}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateApplication}
      />

      <UploadResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onUpload={handleFileUpload}
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-medium">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-2 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Undo Toast */}
      {pendingDelete && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-auto bg-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium flex-1">
            {pendingDelete.type === 'application' ? 'Application deleted' : 'Item deleted'}
          </span>
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors text-sm"
          >
            Undo
          </button>
          <button
            onClick={handleCloseUndo}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}