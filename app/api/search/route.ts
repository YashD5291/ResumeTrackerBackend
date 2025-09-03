import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { withAuth } from '@/middleware/auth'
import { SearchQuerySchema } from '@/utils/validation'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(req.url)
      const query = searchParams.get('q')
      const status = searchParams.get('status')
      const tags = searchParams.get('tags')?.split(',')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const companyName = searchParams.get('company')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      await dbConnect()

      const filter: any = { userId }

      if (query) {
        filter.$or = [
          { companyName: { $regex: query, $options: 'i' } },
          { jobTitle: { $regex: query, $options: 'i' } },
          { resumeName: { $regex: query, $options: 'i' } },
          { notes: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }

      if (status) filter.status = status
      if (tags && tags.length > 0) filter.tags = { $in: tags }
      if (companyName) {
        filter.companyName = { $regex: companyName, $options: 'i' }
      }

      if (dateFrom || dateTo) {
        filter.dateApplied = {}
        if (dateFrom) filter.dateApplied.$gte = new Date(dateFrom)
        if (dateTo) filter.dateApplied.$lte = new Date(dateTo)
      }

      const applications = await Application.find(filter)
        .sort({ dateApplied: -1 })
        .limit(limit)
        .skip(offset)

      const total = await Application.countDocuments(filter)

      return NextResponse.json({
        applications,
        total,
        hasMore: offset + applications.length < total,
        query: {
          searchTerm: query,
          status,
          tags,
          dateFrom,
          dateTo,
          companyName
        }
      })
    } catch (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }
  })
}