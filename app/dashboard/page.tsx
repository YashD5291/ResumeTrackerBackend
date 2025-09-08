'use client'

import { useState } from 'react'
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
    error,
    setError,

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} error={error} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resumeCount={resumes.length}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab
            analytics={analytics}
            applications={applications}
            resumes={resumes}
          />
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <ApplicationsTab
            applications={applications}
            resumes={resumes}
            onUpdateStatus={updateApplicationStatus}
            onDeleteApplication={deleteApplication}
            onExportData={exportData}
            onAddApplication={() => setShowAddModal(true)}
            onViewResume={handleViewResume}
            onDownloadResume={downloadResume}
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
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
          <button onClick={() => setError('')} className="ml-4 font-bold">×</button>
        </div>
      )}
    </div>
  )
}