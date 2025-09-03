import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { withAuth } from '@/middleware/auth'

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      
      await dbConnect()

      const user = await User.findOneAndUpdate(
        { userId },
        {
          $set: {
            'preferences.autoDetect': body.autoDetect ?? undefined,
            'preferences.defaultStatus': body.defaultStatus ?? undefined,
            'preferences.emailNotifications': body.emailNotifications ?? undefined
          }
        },
        { new: true, runValidators: true }
      ).select('-password')

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        user: {
          userId: user.userId,
          email: user.email,
          preferences: user.preferences
        }
      })
    } catch (error) {
      console.error('Update preferences error:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }
  })
}