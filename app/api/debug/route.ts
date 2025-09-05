import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { Application } from '@/models/Application'
import { Resume } from '@/models/Resume'

export async function GET() {
  try {
    await dbConnect()

    const [userCount, applicationCount, resumeCount, recentUsers, recentApplications] = await Promise.all([
      User.countDocuments(),
      Application.countDocuments(),
      Resume.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Application.find().sort({ dateCreated: -1 }).limit(5).select('userId companyName jobTitle dateApplied')
    ])

    return NextResponse.json({
      database: 'Connected successfully',
      collections: {
        users: userCount,
        applications: applicationCount,
        resumes: resumeCount
      },
      recentUsers: recentUsers.map(user => ({
        userId: user.userId,
        email: user.email || 'Anonymous',
        createdAt: user.createdAt
      })),
      recentApplications: recentApplications.map(app => ({
        userId: app.userId,
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        dateApplied: app.dateApplied
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database check failed',
      message: error.message
    }, { status: 500 })
  }
}