'use client'

import { useState } from 'react'
import { Resume, COLORS } from '../types'

interface NewApplication {
  url: string
  companyName: string
  jobTitle: string
  resumeId: string
  resumeName: string
  resumeFilename: string
  status: string
  notes: string
  tags: string[]
  location: {
    city: string
    state: string
    country: string
    remote: boolean
  }
  salary: {
    amount: string
    currency: string
    type: 'annual' | 'hourly' | 'monthly'
  }
}

interface AddApplicationModalProps {
  isOpen: boolean
  resumes: Resume[]
  onClose: () => void
  onSubmit: (application: NewApplication) => Promise<void>
}

export default function AddApplicationModal({
  isOpen,
  resumes,
  onClose,
  onSubmit
}: AddApplicationModalProps) {
  const [newApp, setNewApp] = useState<NewApplication>({
    url: '',
    companyName: '',
    jobTitle: '',
    resumeId: '',
    resumeName: '',
    resumeFilename: '',
    status: 'Applied',
    notes: '',
    tags: [],
    location: {
      city: '',
      state: '',
      country: '',
      remote: false
    },
    salary: {
      amount: '',
      currency: 'USD',
      type: 'annual'
    }
  })

  const handleSubmit = async () => {
    await onSubmit(newApp)
    setNewApp({
      url: '',
      companyName: '',
      jobTitle: '',
      resumeId: '',
      resumeName: '',
      resumeFilename: '',
      status: 'Applied',
      notes: '',
      tags: [],
      location: { city: '', state: '', country: '', remote: false },
      salary: { amount: '', currency: 'USD', type: 'annual' }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4 py-6 sm:py-10">
      <div className="relative mx-auto p-4 sm:p-5 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Application</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job URL *</label>
              <input
                type="url"
                value={newApp.url}
                onChange={(e) => setNewApp({...newApp, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                value={newApp.companyName}
                onChange={(e) => setNewApp({...newApp, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              value={newApp.jobTitle}
              onChange={(e) => setNewApp({...newApp, jobTitle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume</label>
            <select
              value={newApp.resumeId}
              onChange={(e) => setNewApp({...newApp, resumeId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No resume selected</option>
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>
                  {resume.name} ({resume.filename})
                </option>
              ))}
            </select>
            {resumes.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No resumes uploaded yet. Upload a resume in the Resumes tab.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={newApp.location.city}
                onChange={(e) => setNewApp({...newApp, location: {...newApp.location, city: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={newApp.location.state}
                onChange={(e) => setNewApp({...newApp, location: {...newApp.location, state: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end col-span-2 sm:col-span-1">
              <label className="flex items-center py-2">
                <input
                  type="checkbox"
                  checked={newApp.location.remote}
                  onChange={(e) => setNewApp({...newApp, location: {...newApp.location, remote: e.target.checked}})}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Remote</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="number"
                value={newApp.salary.amount}
                onChange={(e) => setNewApp({...newApp, salary: {...newApp.salary, amount: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newApp.salary.type}
                onChange={(e) => setNewApp({...newApp, salary: {...newApp.salary, type: e.target.value as any}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="annual">Annual</option>
                <option value="hourly">Hourly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newApp.status}
                onChange={(e) => setNewApp({...newApp, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(COLORS).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={newApp.notes}
              onChange={(e) => setNewApp({...newApp, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newApp.url || !newApp.companyName || !newApp.jobTitle}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Add Application
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}