import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { withAuth } from '@/middleware/auth'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { applications } = await req.json()

      if (!Array.isArray(applications)) {
        return NextResponse.json(
          { error: 'Applications must be an array' },
          { status: 400 }
        )
      }

      await dbConnect()

      const results = []
      const errors = []

      for (let i = 0; i < applications.length; i++) {
        try {
          const appData = applications[i]
          
          if (appData.id) {
            const existingApp = await Application.findOne({
              userId,
              id: appData.id
            })

            if (existingApp) {
              const updatedApp = await Application.findOneAndUpdate(
                { userId, id: appData.id },
                {
                  ...appData,
                  userId,
                  lastUpdated: new Date()
                },
                { new: true, runValidators: true }
              )
              results.push({ action: 'updated', application: updatedApp })
            } else {
              const newApp = await Application.create({
                ...appData,
                userId,
                dateCreated: new Date(),
                lastUpdated: new Date(),
                statusHistory: appData.statusHistory || [{
                  status: appData.status || 'Applied',
                  date: appData.dateApplied ? new Date(appData.dateApplied) : new Date()
                }]
              })
              results.push({ action: 'created', application: newApp })
            }
          } else {
            const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            const newApp = await Application.create({
              ...appData,
              userId,
              id: applicationId,
              dateCreated: new Date(),
              lastUpdated: new Date(),
              statusHistory: appData.statusHistory || [{
                status: appData.status || 'Applied',
                date: appData.dateApplied ? new Date(appData.dateApplied) : new Date()
              }]
            })
            results.push({ action: 'created', application: newApp })
          }
        } catch (error: any) {
          errors.push({
            index: i,
            error: error.message
          })
        }
      }

      return NextResponse.json({
        success: results.length,
        errorCount: errors.length,
        results,
        errors
      })
    } catch (error) {
      console.error('Batch applications error:', error)
      return NextResponse.json(
        { error: 'Failed to process batch applications' },
        { status: 500 }
      )
    }
  })
}