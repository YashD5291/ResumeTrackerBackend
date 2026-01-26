import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { withAuth } from '@/middleware/auth'
import { ApplicationSchema } from '@/utils/validation'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(req.url)
      const status = searchParams.get('status')
      const tags = searchParams.get('tags')?.split(',')
      const companyName = searchParams.get('company')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')
      const sortBy = searchParams.get('sortBy') || 'dateApplied'
      const order = searchParams.get('order') || 'desc'

      await dbConnect()

      const filter: any = { userId }

      if (status) filter.status = status
      if (tags && tags.length > 0) filter.tags = { $in: tags }
      if (companyName) {
        // Search both company name and job title
        filter.$or = [
          { companyName: { $regex: companyName, $options: 'i' } },
          { jobTitle: { $regex: companyName, $options: 'i' } }
        ]
      }

      const sortOrder = order === 'desc' ? -1 : 1
      const sortObj: any = {}
      sortObj[sortBy] = sortOrder

      const applications = await Application.find(filter)
        .sort(sortObj)
        .limit(limit)
        .skip(offset)

      const total = await Application.countDocuments(filter)

      return NextResponse.json({
        applications,
        total,
        hasMore: offset + applications.length < total
      })
    } catch (error) {
      console.error('Get applications error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await req.json()
      const validatedData = ApplicationSchema.parse(body)

      await dbConnect()

      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      const statusHistory = [{
        status: validatedData.status || 'Applied',
        date: validatedData.dateApplied ? new Date(validatedData.dateApplied) : new Date(),
        notes: validatedData.notes
      }]

      const application = await Application.create({
        userId,
        id: applicationId,
        url: validatedData.url,
        site: validatedData.site,
        companyName: validatedData.companyName,
        jobTitle: validatedData.jobTitle,
        resumeId: validatedData.resumeId,
        resumeName: validatedData.resumeName,
        resumeFilename: validatedData.resumeFilename,
        status: validatedData.status || 'Applied',
        tags: validatedData.tags || [],
        dateApplied: validatedData.dateApplied ? new Date(validatedData.dateApplied) : new Date(),
        dateCreated: new Date(),
        lastUpdated: new Date(),
        notes: validatedData.notes,
        statusHistory,
        salary: validatedData.salary,
        location: validatedData.location,
        applicationSource: 'manual'
      })

      return NextResponse.json({ application })
    } catch (error: any) {
      console.error('Create application error:', error)
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data', details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }
  })
}