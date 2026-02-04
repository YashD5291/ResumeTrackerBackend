'use client'

import { useState, useRef, useEffect } from 'react'
import { User } from '../types'

interface DashboardHeaderProps {
  user: User
  activeTab: 'overview' | 'applications' | 'resumes' | 'analytics'
  setActiveTab: (tab: 'overview' | 'applications' | 'resumes' | 'analytics') => void
  resumeCount: number
  onLogout: () => void
  onSearch: (query: string) => void
  searchQuery: string
}

export default function DashboardHeader({
  user,
  activeTab,
  setActiveTab,
  resumeCount,
  onLogout,
  onSearch,
  searchQuery
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Handle '/' keyboard shortcut to focus search and ESC to clear
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search when '/' is pressed (and not in an input/textarea)
      if (e.key === '/' &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Clear search when ESC is pressed and search is focused
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        handleClearSearch()
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [searchQuery])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleSearchChange = (value: string) => {
    onSearch(value)
    // Auto-switch to applications tab when searching
    if (value && activeTab !== 'applications') {
      setActiveTab('applications')
    }
  }

  const handleClearSearch = () => {
    onSearch('')
  }

  const tabs: Array<{ id: 'overview' | 'applications' | 'resumes' | 'analytics'; label: string; badge?: number; icon: JSX.Element }> = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'applications', label: 'Applications', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'resumes', label: 'Resumes', badge: resumeCount, icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )}
  ]

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Resume Tracker
              </h1>
            </div>

            <nav className="hidden md:flex items-center bg-slate-100/80 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center relative w-72">
              <svg className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
              />
              <div className="absolute right-3 flex items-center gap-2">
                {searchQuery ? (
                  <button
                    onClick={handleClearSearch}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors font-medium"
                  >
                    Clear
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                      /
                    </kbd>
                  </div>
                )}
                {searchQuery && (
                  <kbd className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                    ESC
                  </kbd>
                )}
              </div>
            </div>

            {/* User Menu Dropdown */}
            <div ref={userMenuRef} className="hidden sm:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {(user.email || user.userId)[0].toUpperCase()}
                </div>
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.email || `User ${user.userId.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Signed in</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col gap-1 bg-slate-100/80 rounded-xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile user info */}
            <div className="sm:hidden mt-3 flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {(user.email || user.userId)[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 truncate">
                {user.email || `${user.userId.slice(5, 15)}...`}
              </span>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}