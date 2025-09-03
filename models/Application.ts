import { Schema, model, models, Document } from 'mongoose'

export interface IApplication extends Document {
  userId: string
  id: string
  url: string
  site: string
  companyName: string
  jobTitle: string
  resumeId?: string
  resumeName?: string
  resumeFilename?: string
  status: string
  tags: string[]
  dateApplied: Date
  dateCreated: Date
  lastUpdated: Date
  notes?: string
  statusHistory: Array<{
    status: string
    date: Date
    notes?: string
  }>
  salary?: {
    amount?: number
    currency?: string
    type?: string
  }
  location?: {
    city?: string
    state?: string
    country?: string
    remote?: boolean
  }
  applicationSource: string
}

const ApplicationSchema = new Schema<IApplication>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  site: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true,
    index: true
  },
  resumeId: String,
  resumeName: String,
  resumeFilename: String,
  status: {
    type: String,
    default: 'Applied',
    index: true,
    enum: ['Applied', 'Interview', 'Rejected', 'Offer', 'Accepted', 'Withdrawn', 'Pending']
  },
  tags: [{
    type: String,
    index: true
  }],
  dateApplied: {
    type: Date,
    default: Date.now,
    index: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: String,
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  salary: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['hourly', 'annual', 'monthly', 'weekly']
    }
  },
  location: {
    city: String,
    state: String,
    country: String,
    remote: Boolean
  },
  applicationSource: {
    type: String,
    default: 'extension',
    enum: ['extension', 'manual', 'import']
  }
}, {
  timestamps: true
})

ApplicationSchema.index({ userId: 1, id: 1 })
ApplicationSchema.index({ userId: 1, status: 1 })
ApplicationSchema.index({ userId: 1, dateApplied: -1 })
ApplicationSchema.index({ userId: 1, companyName: 1 })
ApplicationSchema.index({ userId: 1, tags: 1 })
ApplicationSchema.index({ '$**': 'text' })

export const Application = models.Application || model<IApplication>('Application', ApplicationSchema)