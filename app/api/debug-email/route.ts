import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { Application } from '@/models/Application'

export async function GET() {
  try {
    await dbConnect()

    // Find all users with this email
    const usersWithEmail = await User.find({ email: 'juanflores.work@outlook.com' }).select('-password')
    
    // Find applications for each of these users
    const applicationsByUser = []
    for (const user of usersWithEmail) {
      const apps = await Application.find({ userId: user.userId })
      applicationsByUser.push({
        userId: user.userId,
        email: user.email,
        createdAt: user.createdAt,
        applicationCount: apps.length,
        applications: apps.map(app => ({
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          dateApplied: app.dateApplied
        }))
      })
    }

    return NextResponse.json({
      email: 'juanflores.work@outlook.com',
      usersFound: usersWithEmail.length,
      users: applicationsByUser
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message
    }, { status: 500 })
  }
}