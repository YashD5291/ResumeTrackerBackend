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

      const [user, applicationCount, resumeCount, lastApplication, lastResume] = await Promise.all([
        User.findOne({ userId }).select('lastActive'),
        Application.countDocuments({ userId }),
        Resume.countDocuments({ userId, isActive: true }),
        Application.findOne({ userId }).sort({ lastUpdated: -1 }).select('lastUpdated'),
        Resume.findOne({ userId, isActive: true }).sort({ lastModified: -1 }).select('lastModified')
      ])

      const lastDataUpdate = Math.max(
        lastApplication?.lastUpdated?.getTime() || 0,
        lastResume?.lastModified?.getTime() || 0
      )

      return NextResponse.json({
        success: true,
        status: {
          userId,
          lastActive: user?.lastActive,
          lastDataUpdate: lastDataUpdate ? new Date(lastDataUpdate) : null,
          counts: {
            applications: applicationCount,
            resumes: resumeCount
          },
          serverTime: new Date()
        }
      })
    } catch (error) {
      console.error('Sync status error:', error)
      return NextResponse.json(
        { error: 'Failed to get sync status' },
        { status: 500 }
      )
    }
  })
}