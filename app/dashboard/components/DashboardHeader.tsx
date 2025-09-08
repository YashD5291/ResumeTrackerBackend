'use client'

import { User } from '../types'

interface DashboardHeaderProps {
  user: User
  activeTab: 'overview' | 'applications' | 'resumes' | 'analytics'
  setActiveTab: (tab: 'overview' | 'applications' | 'resumes' | 'analytics') => void
  resumeCount: number
  onLogout: () => void
}

export default function DashboardHeader({ 
  user, 
  activeTab, 
  setActiveTab, 
  resumeCount, 
  onLogout 
}: DashboardHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Resume Tracker Pro</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'applications' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab('resumes')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'resumes' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Resumes ({resumeCount})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'analytics' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user.email || `User ID: ${user.userId.slice(5, 15)}...`}
            </span>
            <button
              onClick={onLogout}
              className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}