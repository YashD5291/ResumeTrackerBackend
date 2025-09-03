import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Resume } from '@/models/Resume'
import { withAuth } from '@/middleware/auth'
import { ResumeUploadSchema } from '@/utils/validation'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const resumes = await Resume.find({ userId, isActive: true })
        .select('-pdfData')
        .sort({ dateAdded: -1 })

      return NextResponse.json({ resumes })
    } catch (error) {
      console.error('Get resumes error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch resumes' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const formData = await req.formData()
      const pdfFile = formData.get('pdf') as File
      const name = formData.get('name') as string
      const filename = formData.get('filename') as string

      if (!pdfFile) {
        return NextResponse.json(
          { error: 'No PDF file provided' },
          { status: 400 }
        )
      }

      if (pdfFile.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Only PDF files are allowed' },
          { status: 400 }
        )
      }

      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB' },
          { status: 400 }
        )
      }

      const bytes = await pdfFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const pdfData = buffer.toString('base64')

      await dbConnect()

      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      const resume = await Resume.create({
        userId,
        id: resumeId,
        name: name || pdfFile.name.replace('.pdf', ''),
        filename: filename || pdfFile.name,
        fileSize: pdfFile.size,
        mimeType: pdfFile.type,
        pdfData,
        dateAdded: new Date(),
        lastModified: new Date(),
        isActive: true,
        metadata: {
          pages: 1,
          keywords: [],
          extractedText: ''
        }
      })

      const resumeResponse = resume.toObject()
      delete resumeResponse.pdfData

      return NextResponse.json({ resume: resumeResponse })
    } catch (error: any) {
      console.error('Upload resume error:', error)
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data', details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to upload resume' },
        { status: 500 }
      )
    }
  })
}