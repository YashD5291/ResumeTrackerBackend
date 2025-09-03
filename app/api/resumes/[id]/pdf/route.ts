import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Resume } from '@/models/Resume'
import { withAuth } from '@/middleware/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const resume = await Resume.findOne({ 
        userId, 
        id: params.id, 
        isActive: true 
      })

      if (!resume || !resume.pdfData) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      const pdfBuffer = Buffer.from(resume.pdfData, 'base64')

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${resume.filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
    } catch (error) {
      console.error('Download resume error:', error)
      return NextResponse.json(
        { error: 'Failed to download resume' },
        { status: 500 }
      )
    }
  })
}