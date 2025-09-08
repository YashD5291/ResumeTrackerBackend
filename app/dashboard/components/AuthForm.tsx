'use client'

import { useState } from 'react'

interface AuthFormProps {
  onAuth: (email?: string, password?: string, isRegister?: boolean) => Promise<void>
  error: string
}

export default function AuthForm({ onAuth, error }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Tracker Pro</h1>
          <p className="text-gray-600 mt-2">Track your job applications and resumes</p>
        </div>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email (optional for anonymous)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="password"
            placeholder="Password (optional for anonymous)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAuth(email, password, false)}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login
            </button>
            
            <button
              onClick={() => onAuth(email, password, true)}
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Register
            </button>
          </div>
          
          <button
            onClick={() => onAuth()}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Continue Anonymously
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}