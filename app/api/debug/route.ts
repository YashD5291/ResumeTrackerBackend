import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { Application } from '@/models/Application'
import { Resume } from '@/models/Resume'

export async function GET() {
  try {
    await dbConnect()

    const [userCount, applicationCount, resumeCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      Application.countDocuments(),
      Resume.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password')
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
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database check failed',
      message: error.message
    }, { status: 500 })
  }
}