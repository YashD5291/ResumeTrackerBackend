import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'

export async function GET() {
  try {
    // Test basic API response
    const basicTest = {
      status: 'API is working!',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    }

    // Test database connection
    let dbTest = {
      connected: false,
      error: null
    }

    try {
      await dbConnect()
      dbTest.connected = true
      dbTest.error = null
    } catch (error: any) {
      dbTest.connected = false
      dbTest.error = error.message
    }

    // Test environment variables
    const envTest = {
      mongodbUri: process.env.MONGODB_URI ? 'Present' : 'Missing',
      jwtSecret: process.env.JWT_SECRET ? 'Present' : 'Missing'
    }

    return NextResponse.json({
      api: basicTest,
      database: dbTest,
      environment: envTest
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test endpoint failed',
      message: error.message
    }, { status: 500 })
  }
}