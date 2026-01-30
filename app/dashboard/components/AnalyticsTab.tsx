'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Analytics, Resume, Application, COLORS } from '../types'

interface AnalyticsTabProps {
  analytics: Analytics | null
  resumes: Resume[]
  applications: Application[]
}

export default function AnalyticsTab({ analytics, resumes, applications }: AnalyticsTabProps) {
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

  return (
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
              <div key={resume.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{resume.name}</p>
                    <p className="text-sm text-gray-500">Used {stats.usageCount} times</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-6 ml-11 sm:ml-0 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Success Rate</p>
                    <p className="text-base sm:text-lg font-semibold text-indigo-600">{stats.successRate}%</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Successful</p>
                    <p className="text-base sm:text-lg font-semibold text-green-600">{stats.successfulApps}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}