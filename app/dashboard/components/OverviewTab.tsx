'use client'

import { Analytics, Application, Resume } from '../types'

interface OverviewTabProps {
  analytics: Analytics | null
  applications: Application[]
  resumes: Resume[]
  analyticsLoading?: boolean
}

export default function OverviewTab({ analytics, applications, resumes, analyticsLoading }: OverviewTabProps) {
  // Skeleton for stats when loading
  const StatSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded-lg w-24 animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-16 animate-pulse"></div>
        </div>
        <div className="p-3 bg-slate-100 rounded-xl w-12 h-12 animate-pulse"></div>
      </div>
      <div className="h-3 bg-slate-200 rounded-lg w-20 mt-3 animate-pulse"></div>
    </div>
  )
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsLoading && !analytics ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics?.overview.totalApplications || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {analytics?.overview.recentApplications || 0} this month
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Resumes</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">
                    {resumes.length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Ready to use</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {analytics?.overview.responseRate || 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Companies responded</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {analytics?.overview.successRate || 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Offers received</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Applications with Resume Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      {app.companyName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.companyName}</p>
                    <p className="text-sm text-gray-500">{app.jobTitle}</p>
                    {app.resumeName && (
                      <p className="text-xs text-indigo-600 mt-1">
                        📄 {app.resumeName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'Interview' ? 'bg-yellow-100 text-yellow-700' :
                    app.status === 'Offer' ? 'bg-purple-100 text-purple-700' :
                    app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}