import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { withAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const user = await User.findOne({ userId }).select('-password')
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      user.lastActive = new Date()
      await user.save()

      return NextResponse.json({
        user: {
          userId: user.userId,
          email: user.email,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        }
      })
    } catch (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 500 }
      )
    }
  })
}