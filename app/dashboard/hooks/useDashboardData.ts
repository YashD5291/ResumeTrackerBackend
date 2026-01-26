'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Application, Resume, Analytics } from '../types'

interface NewApplication {
  url: string
  companyName: string
  jobTitle: string
  resumeId: string
  resumeName: string
  resumeFilename: string
  status: string
  notes: string
  tags: string[]
  location: {
    city: string
    state: string
    country: string
    remote: boolean
  }
  salary: {
    amount: string
    currency: string
    type: 'annual' | 'hourly' | 'monthly'
  }
}

export interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasMore: boolean
}

export interface ApplicationFilters {
  status: string
  search: string
  sortBy: string
  order: 'asc' | 'desc'
}

const DEFAULT_ITEMS_PER_PAGE = 50

export function useDashboardData() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    hasMore: false
  })

  // Filters state
  const [filters, setFilters] = useState<ApplicationFilters>({
    status: 'all',
    search: '',
    sortBy: 'dateApplied',
    order: 'desc'
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

  // Fetch applications with pagination and filters
  const fetchApplications = useCallback(async (
    authToken: string,
    page: number = 1,
    currentFilters: ApplicationFilters = filters
  ) => {
    try {
      setApplicationsLoading(true)
      const offset = (page - 1) * DEFAULT_ITEMS_PER_PAGE

      const params = new URLSearchParams({
        limit: DEFAULT_ITEMS_PER_PAGE.toString(),
        offset: offset.toString(),
        sortBy: currentFilters.sortBy,
        order: currentFilters.order
      })

      if (currentFilters.status && currentFilters.status !== 'all') {
        params.append('status', currentFilters.status)
      }

      if (currentFilters.search) {
        params.append('company', currentFilters.search)
      }

      const appsResponse = await fetch(`/api/applications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.applications || [])

        const totalItems = appsData.total || 0
        const totalPages = Math.ceil(totalItems / DEFAULT_ITEMS_PER_PAGE)

        setPagination({
          currentPage: page,
          totalPages: totalPages || 1,
          totalItems,
          itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
          hasMore: appsData.hasMore || false
        })
      }
    } catch (err) {
      setError('Failed to fetch applications')
    } finally {
      setApplicationsLoading(false)
    }
  }, [filters])

  // Load essential data only (user + applications + resumes)
  // Analytics loaded lazily when needed
  const loadData = async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` }

      // Build applications URL
      const appsParams = new URLSearchParams({
        limit: DEFAULT_ITEMS_PER_PAGE.toString(),
        offset: '0',
        sortBy: filters.sortBy,
        order: filters.order
      })

      // Only load essential data - skip analytics (it's heavy)
      const [userResponse, resumesResponse, appsResponse] = await Promise.all([
        fetch('/api/auth/me', { headers }),
        fetch('/api/resumes', { headers }),
        fetch(`/api/applications?${appsParams.toString()}`, { headers })
      ])

      // Process responses in parallel
      const [userData, resumesData, appsData] = await Promise.all([
        userResponse.ok ? userResponse.json() : null,
        resumesResponse.ok ? resumesResponse.json() : null,
        appsResponse.ok ? appsResponse.json() : null
      ])

      if (userData) setUser(userData.user)
      if (resumesData) setResumes(resumesData.resumes || [])

      if (appsData) {
        setApplications(appsData.applications || [])
        const totalItems = appsData.total || 0
        const totalPages = Math.ceil(totalItems / DEFAULT_ITEMS_PER_PAGE)
        setPagination({
          currentPage: 1,
          totalPages: totalPages || 1,
          totalItems,
          itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
          hasMore: appsData.hasMore || false
        })
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Lazy load analytics (call this when user views analytics/overview tab)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false)

  const loadAnalytics = useCallback(async () => {
    if (!token || analyticsLoaded || analyticsLoading) return

    setAnalyticsLoading(true)
    try {
      const response = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        setAnalyticsLoaded(true)
      }
    } catch (err) {
      console.error('Failed to load analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [token, analyticsLoaded, analyticsLoading])

  // Go to specific page
  const goToPage = useCallback(async (page: number) => {
    if (!token || page < 1 || page > pagination.totalPages) return
    await fetchApplications(token, page, filters)
  }, [token, pagination.totalPages, filters, fetchApplications])

  // Update filters and refetch
  const updateFilters = useCallback(async (newFilters: Partial<ApplicationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    if (token) {
      await fetchApplications(token, 1, updatedFilters)
    }
  }, [token, filters, fetchApplications])

  // Reload analytics only
  const reloadAnalytics = useCallback(async () => {
    if (!token) return
    try {
      const analyticsResponse = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (err) {
      console.error('Failed to reload analytics')
    }
  }, [token])

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
        return { url, filename }
      } else {
        setError('Failed to load resume')
        return null
      }
    } catch (err) {
      setError('Failed to load resume')
      return null
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
  const createApplication = async (newApp: NewApplication) => {
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
        reloadAnalytics()
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
        reloadAnalytics()
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
        reloadAnalytics()
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

  // Logout
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setApplications([])
    setResumes([])
    setAnalytics(null)
    setToken('')
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

  return {
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
  }
}