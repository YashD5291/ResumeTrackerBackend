import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Application } from '@/models/Application'
import { Resume } from '@/models/Resume'
import { withAuth } from '@/middleware/auth'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { applications, resumes, lastSyncTimestamp } = await req.json()
      
      await dbConnect()

      const syncTimestamp = new Date()
      const results = {
        applications: { created: 0, updated: 0, conflicts: [] as any[] },
        resumes: { created: 0, updated: 0, conflicts: [] as any[] }
      }

      if (applications && Array.isArray(applications)) {
        for (const appData of applications) {
          try {
            const existingApp = await Application.findOne({
              userId,
              id: appData.id
            })

            if (existingApp) {
              if (existingApp.lastUpdated > new Date(appData.lastUpdated)) {
                results.applications.conflicts.push({
                  id: appData.id,
                  type: 'server_newer',
                  serverData: existingApp,
                  clientData: appData
                })
                continue
              }

              await Application.findOneAndUpdate(
                { userId, id: appData.id },
                {
                  ...appData,
                  userId,
                  lastUpdated: syncTimestamp
                },
                { new: true, runValidators: true }
              )
              results.applications.updated++
            } else {
              await Application.create({
                ...appData,
                userId,
                dateCreated: appData.dateCreated || syncTimestamp,
                lastUpdated: syncTimestamp,
                statusHistory: appData.statusHistory || [{
                  status: appData.status || 'Applied',
                  date: appData.dateApplied ? new Date(appData.dateApplied) : syncTimestamp
                }]
              })
              results.applications.created++
            }
          } catch (error: any) {
            console.error(`Error processing application ${appData.id}:`, error)
          }
        }
      }

      if (resumes && Array.isArray(resumes)) {
        for (const resumeData of resumes) {
          try {
            const existingResume = await Resume.findOne({
              userId,
              id: resumeData.id
            })

            if (existingResume) {
              if (existingResume.lastModified > new Date(resumeData.lastModified)) {
                results.resumes.conflicts.push({
                  id: resumeData.id,
                  type: 'server_newer',
                  serverData: existingResume,
                  clientData: resumeData
                })
                continue
              }

              await Resume.findOneAndUpdate(
                { userId, id: resumeData.id },
                {
                  ...resumeData,
                  userId,
                  lastModified: syncTimestamp
                },
                { new: true, runValidators: true }
              )
              results.resumes.updated++
            } else {
              await Resume.create({
                ...resumeData,
                userId,
                dateAdded: resumeData.dateAdded || syncTimestamp,
                lastModified: syncTimestamp
              })
              results.resumes.created++
            }
          } catch (error: any) {
            console.error(`Error processing resume ${resumeData.id}:`, error)
          }
        }
      }

      return NextResponse.json({
        success: true,
        syncTimestamp,
        results
      })
    } catch (error) {
      console.error('Sync push error:', error)
      return NextResponse.json(
        { error: 'Failed to push sync data' },
        { status: 500 }
      )
    }
  })
}