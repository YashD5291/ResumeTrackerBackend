import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { withAuth } from '@/middleware/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const application = await Application.findOne({ 
        userId, 
        id: params.id 
      })

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ application })
    } catch (error) {
      console.error('Get application error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch application' },
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

      const existingApp = await Application.findOne({ 
        userId, 
        id: params.id 
      })

      if (!existingApp) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      const updateData: any = {
        lastUpdated: new Date()
      }

      if (body.status && body.status !== existingApp.status) {
        updateData.status = body.status
        updateData.$push = {
          statusHistory: {
            status: body.status,
            date: new Date(),
            notes: body.statusNotes
          }
        }
      }

      if (body.companyName) updateData.companyName = body.companyName
      if (body.jobTitle) updateData.jobTitle = body.jobTitle
      if (body.resumeId) updateData.resumeId = body.resumeId
      if (body.resumeName) updateData.resumeName = body.resumeName
      if (body.resumeFilename) updateData.resumeFilename = body.resumeFilename
      if (body.tags) updateData.tags = body.tags
      if (body.notes !== undefined) updateData.notes = body.notes
      if (body.salary) updateData.salary = body.salary
      if (body.location) updateData.location = body.location

      const application = await Application.findOneAndUpdate(
        { userId, id: params.id },
        updateData,
        { new: true, runValidators: true }
      )

      return NextResponse.json({ application })
    } catch (error) {
      console.error('Update application error:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
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

      const application = await Application.findOneAndDelete({ 
        userId, 
        id: params.id 
      })

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Application deleted successfully' })
    } catch (error) {
      console.error('Delete application error:', error)
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      )
    }
  })
}