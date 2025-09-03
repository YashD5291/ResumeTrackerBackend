import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/models/User'
import { hashPassword, generateToken, generateUserId } from '@/utils/auth'
import { RegisterSchema } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RegisterSchema.parse(body)

    await dbConnect()

    let userId = validatedData.userId || generateUserId()
    let hashedPassword

    if (validatedData.email) {
      const existingUser = await User.findOne({ email: validatedData.email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }
    }

    if (validatedData.password) {
      hashedPassword = await hashPassword(validatedData.password)
    }

    const user = await User.create({
      userId,
      email: validatedData.email,
      password: hashedPassword,
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        autoDetect: true,
        defaultStatus: 'Applied',
        emailNotifications: false
      }
    })

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
    console.error('Registration error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}