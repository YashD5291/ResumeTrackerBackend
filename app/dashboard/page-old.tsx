'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Resume {
  _id: string
  id: string
  name: string
  filename: string
  fileSize: number
  dateAdded: string
  lastModified: string
  isActive: boolean
}

interface Application {
  _id: string
  id: string
  url: string
  site: string
  companyName: string
  jobTitle: string
  resumeId?: string
  resumeName?: string
  resumeFilename?: string
  status: string
  tags: string[]
  dateApplied: string
  dateCreated: string
  lastUpdated: string
  notes?: string
  salary?: {
    amount?: number
    currency?: string
    type?: string
  }
  location?: {
    city?: string
    state?: string
    country?: string
    remote?: boolean
  }
}

interface User {
  userId: string
  email?: string
  preferences: {
    autoDetect: boolean
    defaultStatus: string
    emailNotifications: boolean
  }
}

interface Analytics {
  overview: {
    totalApplications: number
    recentApplications: number
    totalResumes: number
    responseRate: number
    successRate: number
  }
  statusDistribution: Record<string, number>
  monthlyTrends: Array<{
    _id: { year: number; month: number }
    count: number
  }>
  dailyTrends: Array<{
    _id: { year: number; month: number; day: number }
    count: number
  }>
  topCompanies: Array<{
    _id: string
    count: number
  }>
  averageResponseTime: number | null
}

const COLORS = {
  Applied: '#3B82F6',
  Interview: '#F59E0B',
  Offer: '#8B5CF6',
  Accepted: '#10B981',
  Rejected: '#EF4444',
  Withdrawn: '#6B7280',
  Pending: '#94A3B8'
}

export default function AdvancedDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dateApplied')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'resumes' | 'analytics'>('overview')
  const [viewingResumeId, setViewingResumeId] = useState<string | null>(null)
  const [viewingResumeFilename, setViewingResumeFilename] = useState<string>('')
  const [viewingResumeUrl, setViewingResumeUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states for new application
  const [newApp, setNewApp] = useState({
    url: '',
    companyName: '',
    jobTitle: '',
    resumeId: '',
    resumeName: '',
    resumeFilename: '',
    status: 'Applied',
    notes: '',
    tags: [] as string[],
    location: {
      city: '',
      state: '',
      country: '',
      remote: false
    },
    salary: {
      amount: '',
      currency: 'USD',
      type: 'annual' as 'annual' | 'hourly' | 'monthly'
    }
  })

  // Authentication
  const handleAuth = async (email?: string, password?: string, isRegister = false) => {
    try {
      setError('')
      
      let endpoint = '/api/auth/register'
      let body: any = {}
      
      if (email && password) {
        endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
        body = { email, password }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }
      
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      loadData(data.token)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    }
  }

  // Load all data
  const loadData = async (authToken: string) => {
    try {
      // Load user
      const userResponse = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      // Load applications
      const appsResponse = await fetch('/api/applications?limit=100', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.applications || [])
      }

      // Load resumes
      const resumesResponse = await fetch('/api/resumes', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json()
        setResumes(resumesData.resumes || [])
      }

      // Load analytics
      const analyticsResponse = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Initialize
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      loadData(savedToken)
    } else {
      setLoading(false)
    }
  }, [])


  // Upload Resume
  const uploadResume = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('name', file.name.replace('.pdf', ''))
      formData.append('filename', file.name)

      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setResumes(prev => [...prev, data.resume])
        return data.resume
      } else {
        throw new Error('Failed to upload resume')
      }
    } catch (err) {
      setError('Failed to upload resume')
      return null
    }
  }

  // View Resume
  const viewResume = async (resumeId: string, filename: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setViewingResumeId(resumeId)
        setViewingResumeFilename(filename)
        setViewingResumeUrl(url)
      } else {
        setError('Failed to load resume')
      }
    } catch (err) {
      setError('Failed to load resume')
    }
  }

  // Download Resume
  const downloadResume = async (resumeId: string, filename: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      setError('Failed to download resume')
    }
  }

  // Delete Resume
  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setResumes(prev => prev.filter(r => r.id !== resumeId))
      }
    } catch (err) {
      setError('Failed to delete resume')
    }
  }

  // Create application
  const createApplication = async () => {
    try {
      const selectedResume = resumes.find(r => r.id === newApp.resumeId)
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newApp,
          site: new URL(newApp.url).hostname,
          dateApplied: new Date().toISOString(),
          resumeName: selectedResume?.name || newApp.resumeName,
          resumeFilename: selectedResume?.filename || newApp.resumeFilename,
          salary: {
            ...newApp.salary,
            amount: newApp.salary.amount ? parseFloat(newApp.salary.amount) : undefined
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(prev => [data.application, ...prev])
        setShowAddModal(false)
        setNewApp({
          url: '',
          companyName: '',
          jobTitle: '',
          resumeId: '',
          resumeName: '',
          resumeFilename: '',
          status: 'Applied',
          notes: '',
          tags: [],
          location: { city: '', state: '', country: '', remote: false },
          salary: { amount: '', currency: 'USD', type: 'annual' }
        })
        // Reload only analytics to update stats without resetting preferences
        const analyticsResponse = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }
      }
    } catch (err) {
      setError('Failed to create application')
    }
  }

  // Update application status
  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        setApplications(prev =>
          prev.map(app => app.id === id ? { ...app, status } : app)
        )
        // Reload only analytics to update status distribution without resetting preferences
        const analyticsResponse = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  // Delete application
  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== id))
        // Reload only analytics to update counts without resetting preferences
        const analyticsResponse = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }
      }
    } catch (err) {
      setError('Failed to delete application')
    }
  }

  // Export data
  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `applications_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      setError(`Failed to export ${format}`)
    }
  }

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

  // Get resume usage statistics
  const getResumeStats = (resumeId: string) => {
    const usageCount = applications.filter(app => app.resumeId === resumeId).length
    const successfulApps = applications.filter(
      app => app.resumeId === resumeId && ['Interview', 'Offer', 'Accepted'].includes(app.status)
    ).length
    const successRate = usageCount > 0 ? ((successfulApps / usageCount) * 100).toFixed(1) : '0'
    return { usageCount, successfulApps, successRate }
  }

  // Prepare chart data
  const monthlyData = analytics?.monthlyTrends?.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    applications: item.count
  })) || []

  const dailyData = analytics?.dailyTrends?.map(item => ({
    date: `${item._id.month}/${item._id.day}`,
    applications: item.count
  })) || []

  const statusData = Object.entries(analytics?.statusDistribution || {}).map(([status, count]) => ({
    name: status,
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#94A3B8'
  }))

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Resume Tracker Pro</h1>
            <p className="text-gray-600 mt-2">Track your job applications and resumes</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email (optional for anonymous)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="password"
              placeholder="Password (optional for anonymous)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAuth(email, password, false)}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Login
              </button>
              
              <button
                onClick={() => handleAuth(email, password, true)}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Register
              </button>
            </div>
            
            <button
              onClick={() => handleAuth()}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Continue Anonymously
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  Resumes ({resumes.length})
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
                onClick={() => {
                  localStorage.removeItem('token')
                  setUser(null)
                  setApplications([])
                  setToken('')
                }}
                className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
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
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  + Add Application
                </button>
                
                <button
                  onClick={() => exportData('csv')}
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
                    onClick={() => setShowAddModal(true)}
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
                                      viewResume(app.resumeId, app.resumeFilename || 'resume.pdf')
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
                                  onClick={() => app.resumeId && downloadResume(app.resumeId, app.resumeFilename || 'resume.pdf')}
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
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
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
                                onClick={() => deleteApplication(app.id)}
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
        )}

        {/* Resumes Tab */}
        {activeTab === 'resumes' && (
          <div className="space-y-6">
            {/* Upload Resume Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Resume Management</h2>
              <button
                onClick={() => setShowResumeModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
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
                  onClick={() => setShowResumeModal(true)}
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
                          onClick={() => viewResume(resume.id, resume.filename)}
                          className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition font-medium flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => downloadResume(resume.id, resume.filename)}
                          className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => deleteResume(resume.id)}
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
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Daily Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Applications (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resume Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Performance</h3>
              <div className="space-y-4">
                {resumes.map(resume => {
                  const stats = getResumeStats(resume.id)
                  
                  return (
                    <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{resume.name}</p>
                          <p className="text-sm text-gray-500">Used {stats.usageCount} times</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Success Rate</p>
                          <p className="text-lg font-semibold text-indigo-600">{stats.successRate}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Successful</p>
                          <p className="text-lg font-semibold text-green-600">{stats.successfulApps}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Application</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job URL *</label>
                  <input
                    type="url"
                    value={newApp.url}
                    onChange={(e) => setNewApp({...newApp, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={newApp.companyName}
                    onChange={(e) => setNewApp({...newApp, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={newApp.jobTitle}
                  onChange={(e) => setNewApp({...newApp, jobTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume</label>
                <select
                  value={newApp.resumeId}
                  onChange={(e) => setNewApp({...newApp, resumeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No resume selected</option>
                  {resumes.map(resume => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name} ({resume.filename})
                    </option>
                  ))}
                </select>
                {resumes.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No resumes uploaded yet. Upload a resume in the Resumes tab.
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newApp.location.city}
                    onChange={(e) => setNewApp({...newApp, location: {...newApp.location, city: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newApp.location.state}
                    onChange={(e) => setNewApp({...newApp, location: {...newApp.location, state: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newApp.location.remote}
                      onChange={(e) => setNewApp({...newApp, location: {...newApp.location, remote: e.target.checked}})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Remote</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="number"
                    value={newApp.salary.amount}
                    onChange={(e) => setNewApp({...newApp, salary: {...newApp.salary, amount: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newApp.salary.type}
                    onChange={(e) => setNewApp({...newApp, salary: {...newApp.salary, type: e.target.value as any}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="annual">Annual</option>
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newApp.status}
                    onChange={(e) => setNewApp({...newApp, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(COLORS).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newApp.notes}
                  onChange={(e) => setNewApp({...newApp, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createApplication}
                  disabled={!newApp.url || !newApp.companyName || !newApp.jobTitle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Upload Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Upload Resume</h3>
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF files only (Max 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const resume = await uploadResume(file)
                    if (resume) {
                      setShowResumeModal(false)
                      // Resume was already added to state in uploadResume function
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingResumeUrl && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-[95%] max-w-[1600px] h-[95vh] shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Viewing: {viewingResumeFilename}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => viewingResumeId && downloadResume(viewingResumeId, viewingResumeFilename)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    if (viewingResumeUrl) {
                      URL.revokeObjectURL(viewingResumeUrl)
                    }
                    setViewingResumeId(null)
                    setViewingResumeFilename('')
                    setViewingResumeUrl(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <iframe
              src={viewingResumeUrl}
              className="w-full h-[calc(100%-80px)] border border-gray-300 rounded-lg"
              title="Resume PDF Viewer"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
          <button onClick={() => setError('')} className="ml-4 font-bold">×</button>
        </div>
      )}
    </div>
  )
}