import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const SEARCH_HISTORY_KEY = 'polyaggr_search_history'
const MAX_HISTORY_ITEMS = 5

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (e) {
        console.error('Failed to parse search history:', e)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveToHistory = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    let newHistory = searchHistory.filter(item => item !== trimmed)
    newHistory.unshift(trimmed)
    newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS)

    setSearchHistory(newHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  }

  const removeFromHistory = (query: string) => {
    const newHistory = searchHistory.filter(item => item !== query)
    setSearchHistory(newHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveToHistory(searchQuery)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setShowDropdown(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-600">
      <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-dark-900 font-bold text-lg">P</span>
          </div>
          <span className="font-semibold text-xl text-gray-100">PolyAggr</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 relative">
          <div className="relative" ref={dropdownRef}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search events or user addresses..."
              className="input w-full pl-10 pr-4"
            />

            {/* Search History Dropdown */}
            {showDropdown && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-dark-600 flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase font-medium">Recent Searches</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchHistory([])
                      localStorage.removeItem(SEARCH_HISTORY_KEY)
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 hover:bg-dark-700 transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="flex-1 text-left text-sm text-gray-300 hover:text-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromHistory(item)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/trending"
            className="text-gray-400 hover:text-gray-100 transition-colors text-sm font-medium"
          >
            Trending
          </Link>
          <a
            href="https://polymarket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-sm"
          >
            Trade on Polymarket
          </a>
        </nav>
      </div>
    </header>
  )
}
