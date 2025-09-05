import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { withAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      // Get all applications for this specific user
      const userApplications = await Application.find({ userId }).sort({ dateCreated: -1 })
      
      // Get all applications in database to compare
      const allApplications = await Application.find().select('userId companyName jobTitle')

      return NextResponse.json({
        currentUserId: userId,
        userApplicationsCount: userApplications.length,
        userApplications: userApplications.map(app => ({
          id: app.id,
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          userId: app.userId,
          dateApplied: app.dateApplied
        })),
        allApplicationsInDB: allApplications.map(app => ({
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          userId: app.userId
        }))
      })
    } catch (error: any) {
      return NextResponse.json({
        error: 'Debug failed',
        message: error.message
      }, { status: 500 })
    }
  })
}