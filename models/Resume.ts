import { Schema, model, models, Document } from 'mongoose'

export interface IResume extends Document {
  userId: string
  id: string
  name: string
  filename: string
  fileSize: number
  mimeType: string
  pdfData?: string
  pdfUrl?: string
  dateAdded: Date
  lastModified: Date
  isActive: boolean
  metadata: {
    pages?: number
    keywords?: string[]
    extractedText?: string
  }
}

const ResumeSchema = new Schema<IResume>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  pdfData: {
    type: String
  },
  pdfUrl: {
    type: String
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    pages: Number,
    keywords: [String],
    extractedText: String
  }
}, {
  timestamps: true
})

ResumeSchema.index({ userId: 1, id: 1 })
ResumeSchema.index({ userId: 1, isActive: 1 })
ResumeSchema.index({ dateAdded: -1 })
ResumeSchema.index({ 'metadata.keywords': 1 })

export const Resume = models.Resume || model<IResume>('Resume', ResumeSchema)