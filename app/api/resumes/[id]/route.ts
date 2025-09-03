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
      }).select('-pdfData')

      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ resume })
    } catch (error) {
      console.error('Get resume error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch resume' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      
      await dbConnect()

      const resume = await Resume.findOneAndUpdate(
        { userId, id: params.id, isActive: true },
        {
          $set: {
            name: body.name,
            lastModified: new Date(),
            'metadata.keywords': body.keywords,
            'metadata.extractedText': body.extractedText
          }
        },
        { new: true, runValidators: true }
      ).select('-pdfData')

      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ resume })
    } catch (error) {
      console.error('Update resume error:', error)
      return NextResponse.json(
        { error: 'Failed to update resume' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const resume = await Resume.findOneAndUpdate(
        { userId, id: params.id, isActive: true },
        { $set: { isActive: false } },
        { new: true }
      )

      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Resume deleted successfully' })
    } catch (error) {
      console.error('Delete resume error:', error)
      return NextResponse.json(
        { error: 'Failed to delete resume' },
        { status: 500 }
      )
    }
  })
}