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

export function useDashboardData() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

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
  }
}