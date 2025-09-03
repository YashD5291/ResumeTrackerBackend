import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { Resume } from '@/models/Resume'
import { withAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      await dbConnect()

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        totalApplications,
        applicationsByStatus,
        recentApplications,
        totalResumes,
        applicationsByMonth,
        topCompanies,
        averageResponseTime
      ] = await Promise.all([
        Application.countDocuments({ userId }),
        
        Application.aggregate([
          { $match: { userId } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        
        Application.countDocuments({ 
          userId, 
          dateApplied: { $gte: thirtyDaysAgo } 
        }),
        
        Resume.countDocuments({ userId, isActive: true }),
        
        Application.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: {
                year: { $year: '$dateApplied' },
                month: { $month: '$dateApplied' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ]),
        
        Application.aggregate([
          { $match: { userId } },
          { $group: { _id: '$companyName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        Application.aggregate([
          { 
            $match: { 
              userId,
              status: { $in: ['Interview', 'Offer', 'Accepted'] }
            }
          },
          {
            $addFields: {
              responseTime: {
                $subtract: ['$lastUpdated', '$dateApplied']
              }
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ])
      ])

      const statusMap: any = {
        Applied: 0,
        Interview: 0,
        Rejected: 0,
        Offer: 0,
        Accepted: 0,
        Withdrawn: 0,
        Pending: 0
      }

      applicationsByStatus.forEach((item: any) => {
        statusMap[item._id] = item.count
      })

      const responseRate = totalApplications > 0 
        ? ((statusMap.Interview + statusMap.Offer + statusMap.Accepted) / totalApplications * 100).toFixed(1)
        : '0.0'

      const successRate = totalApplications > 0
        ? ((statusMap.Accepted / totalApplications) * 100).toFixed(1)
        : '0.0'

      return NextResponse.json({
        overview: {
          totalApplications,
          recentApplications,
          totalResumes,
          responseRate: parseFloat(responseRate),
          successRate: parseFloat(successRate)
        },
        statusDistribution: statusMap,
        monthlyTrends: applicationsByMonth,
        topCompanies,
        averageResponseTime: averageResponseTime[0]?.avgResponseTime 
          ? Math.round(averageResponseTime[0].avgResponseTime / (1000 * 60 * 60 * 24))
          : null
      })
    } catch (error) {
      console.error('Analytics error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }
  })
}