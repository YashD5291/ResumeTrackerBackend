import { Schema, model, models, Document } from 'mongoose'

export interface IUser extends Document {
  userId: string
  email?: string
  password?: string
  createdAt: Date
  lastActive: Date
  preferences: {
    autoDetect: boolean
    defaultStatus: string
    emailNotifications: boolean
  }
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    autoDetect: {
      type: Boolean,
      default: true
    },
    defaultStatus: {
      type: String,
      default: 'Applied'
    },
    emailNotifications: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })

export const User = models.User || model<IUser>('User', UserSchema)