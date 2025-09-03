import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { withAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const applications = await Application.find({ userId })
        .sort({ dateApplied: -1 })
        .lean()

      const csvHeaders = [
        'Company Name',
        'Job Title', 
        'Status',
        'Date Applied',
        'URL',
        'Site',
        'Resume Name',
        'Tags',
        'Notes',
        'Salary Amount',
        'Salary Currency',
        'Location City',
        'Location State',
        'Location Country',
        'Remote'
      ].join(',')

      const csvRows = applications.map(app => [
        `"${app.companyName || ''}"`,
        `"${app.jobTitle || ''}"`,
        `"${app.status || ''}"`,
        `"${app.dateApplied ? new Date(app.dateApplied).toISOString().split('T')[0] : ''}"`,
        `"${app.url || ''}"`,
        `"${app.site || ''}"`,
        `"${app.resumeName || ''}"`,
        `"${app.tags ? app.tags.join('; ') : ''}"`,
        `"${(app.notes || '').replace(/"/g, '""')}"`,
        `"${app.salary?.amount || ''}"`,
        `"${app.salary?.currency || ''}"`,
        `"${app.location?.city || ''}"`,
        `"${app.location?.state || ''}"`,
        `"${app.location?.country || ''}"`,
        `"${app.location?.remote ? 'Yes' : 'No'}"`
      ].join(','))

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="applications_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } catch (error) {
      console.error('CSV export error:', error)
      return NextResponse.json(
        { error: 'Failed to export CSV' },
        { status: 500 }
      )
    }
  })
}