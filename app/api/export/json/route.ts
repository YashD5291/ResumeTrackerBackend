import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { Resume } from '@/models/Resume'
import { User } from '@/models/User'
import { withAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const [user, applications, resumes] = await Promise.all([
        User.findOne({ userId }).select('-password'),
        Application.find({ userId }).lean(),
        Resume.find({ userId, isActive: true }).lean()
      ])

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        user: {
          userId: user?.userId,
          email: user?.email,
          preferences: user?.preferences,
          createdAt: user?.createdAt
        },
        applications,
        resumes: resumes.map(resume => ({
          ...resume,
          pdfData: undefined // Don't include PDF data in JSON export
        })),
        stats: {
          totalApplications: applications.length,
          totalResumes: resumes.length
        }
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="resume_tracker_backup_${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    } catch (error) {
      console.error('JSON export error:', error)
      return NextResponse.json(
        { error: 'Failed to export JSON' },
        { status: 500 }
      )
    }
  })
}