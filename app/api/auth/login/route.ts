import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { verifyPassword, generateToken } from '@/utils/auth'
import { LoginSchema } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = LoginSchema.parse(body)

    await dbConnect()

    const user = await User.findOne({ email: validatedData.email })
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    user.lastActive = new Date()
    await user.save()

    const token = generateToken({
      userId: user.userId,
      email: user.email
    })

    return NextResponse.json({
      user: {
        userId: user.userId,
        email: user.email,
        preferences: user.preferences
      },
      token
    })
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}