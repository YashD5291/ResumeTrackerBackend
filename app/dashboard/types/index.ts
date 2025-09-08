export interface Resume {
  _id: string
  id: string
  name: string
  filename: string
  fileSize: number
  dateAdded: string
  lastModified: string
  isActive: boolean
}

export interface Application {
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

export interface User {
  userId: string
  email?: string
  preferences: {
    autoDetect: boolean
    defaultStatus: string
    emailNotifications: boolean
  }
}

export interface Analytics {
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

export const COLORS = {
  Applied: '#3B82F6',
  Interview: '#F59E0B',
  Offer: '#8B5CF6',
  Accepted: '#10B981',
  Rejected: '#EF4444',
  Withdrawn: '#6B7280',
  Pending: '#94A3B8'
}