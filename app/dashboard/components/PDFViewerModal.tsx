'use client'

interface PDFViewerModalProps {
  isOpen: boolean
  resumeUrl: string | null
  filename: string
  onClose: () => void
  onDownload: () => void
}

export default function PDFViewerModal({
  isOpen,
  resumeUrl,
  filename,
  onClose,
  onDownload
}: PDFViewerModalProps) {
  if (!isOpen || !resumeUrl) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
      <div className="relative mx-auto p-3 sm:p-5 border w-full max-w-[1600px] h-[98vh] sm:h-[95vh] shadow-lg rounded-xl bg-white">
        <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 truncate flex-1">
            <span className="hidden sm:inline">Viewing: </span>{filename}
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={onDownload}
              className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <iframe
          src={resumeUrl}
          className="w-full h-[calc(100%-60px)] sm:h-[calc(100%-80px)] border border-gray-300 rounded-lg"
          title="Resume PDF Viewer"
        />
      </div>
    </div>
  )
}