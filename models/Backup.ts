import { Schema, model, models, Document } from 'mongoose'

export interface IBackup extends Document {
  userId: string
  type: string
  version: string
  createdAt: Date
  fileSize: number
  recordCount: number
  checksum: string
  data?: any
}

const BackupSchema = new Schema<IBackup>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['full', 'data_only', 'incremental']
  },
  version: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  recordCount: {
    type: Number,
    required: true
  },
  checksum: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

BackupSchema.index({ userId: 1, createdAt: -1 })

export const Backup = models.Backup || model<IBackup>('Backup', BackupSchema)