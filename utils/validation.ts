import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  userId: z.string().optional()
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const ResumeUploadSchema = z.object({
  name: z.string().min(1),
  filename: z.string().min(1),
  fileSize: z.number().positive().max(10 * 1024 * 1024),
  mimeType: z.string()
})

export const ApplicationSchema = z.object({
  url: z.string().url(),
  site: z.string().min(1),
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  resumeId: z.string().optional(),
  resumeName: z.string().optional(),
  resumeFilename: z.string().optional(),
  status: z.enum(['Applied', 'Interview', 'Rejected', 'Offer', 'Accepted', 'Withdrawn', 'Pending']).optional(),
  tags: z.array(z.string()).optional(),
  dateApplied: z.string().datetime().optional(),
  notes: z.string().optional(),
  salary: z.object({
    amount: z.number().positive().optional(),
    currency: z.string().optional(),
    type: z.enum(['hourly', 'annual', 'monthly', 'weekly']).optional()
  }).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    remote: z.boolean().optional()
  }).optional()
})

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  companyName: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional()
})