import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { Resume } from '@/models/Resume'
import { withAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(req.url)
      const lastSyncTimestamp = searchParams.get('lastSync')
      
      await dbConnect()

      const filter: any = { userId }
      
      if (lastSyncTimestamp) {
        const lastSync = new Date(lastSyncTimestamp)
        filter.$or = [
          { lastUpdated: { $gt: lastSync } },
          { dateCreated: { $gt: lastSync } }
        ]
      }

      const [applications, resumes] = await Promise.all([
        Application.find(filter).sort({ lastUpdated: -1 }),
        Resume.find({ 
          userId, 
          isActive: true,
          ...(lastSyncTimestamp ? { lastModified: { $gt: new Date(lastSyncTimestamp) } } : {})
        }).select('-pdfData').sort({ lastModified: -1 })
      ])

      const syncTimestamp = new Date()

      return NextResponse.json({
        success: true,
        syncTimestamp,
        data: {
          applications,
          resumes
        },
        hasChanges: applications.length > 0 || resumes.length > 0
      })
    } catch (error) {
      console.error('Sync pull error:', error)
      return NextResponse.json(
        { error: 'Failed to pull sync data' },
        { status: 500 }
      )
    }
  })
}