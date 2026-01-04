import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useI18n, useTranslation } from '../../i18n'
import { useTheme } from '../../stores/theme'

const SEARCH_HISTORY_KEY = 'probdata_search_history'
const MAX_HISTORY_ITEMS = 5

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()

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
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg dark:bg-dark-800/80 light:bg-white/80">
      <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-semibold text-xl text-gray-100 dark:text-gray-100 light:text-gray-900">ProbData</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 relative">
          <div className="relative" ref={dropdownRef}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('common.search') + '...'}
              className="input w-full pr-4"
            />

            {/* Search History Dropdown */}
            {showDropdown && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 dark:bg-dark-800 light:bg-white border border-dark-600 dark:border-dark-600 light:border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-dark-600 dark:border-dark-600 light:border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase font-medium">{t('common.recentSearches')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchHistory([])
                      localStorage.removeItem(SEARCH_HISTORY_KEY)
                    }}
                    className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-600 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 transition-all cursor-pointer active:scale-95"
                  >
                    {t('common.clear')}
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 hover:bg-dark-700 dark:hover:bg-dark-700 light:hover:bg-gray-100/30 transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="flex-1 text-left text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-500 light:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="opacity-0 group-hover:opacity-100 transition-all text-gray-500 dark:text-gray-500 light:text-gray-600 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-900 p-1 cursor-pointer active:scale-95"
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
        <nav className="flex items-center gap-4">
          <Link
            to="/trending"
            className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900 transition-colors text-sm font-medium"
          >
            {t('nav.trending')}
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-dark-700 dark:bg-dark-700 light:bg-gray-100 border border-dark-600 dark:border-dark-600 light:border-gray-300 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-200 transition-all cursor-pointer active:scale-95"
            title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-dark-700 dark:bg-dark-700 light:bg-gray-100 border border-dark-600 dark:border-dark-600 light:border-gray-300 rounded-lg p-1">
            <button
              onClick={() => {
                console.log('Switching to Chinese')
                setLocale('zh')
                console.log('Locale after switch:', useI18n.getState().locale)
              }}
              className={`px-2 py-1 text-xs rounded transition-all cursor-pointer active:scale-95 ${
                locale === 'zh'
                  ? 'bg-primary !text-white font-medium'
                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => {
                console.log('Switching to English')
                setLocale('en')
                console.log('Locale after switch:', useI18n.getState().locale)
              }}
              className={`px-2 py-1 text-xs rounded transition-all cursor-pointer active:scale-95 ${
                locale === 'en'
                  ? 'bg-primary !text-white font-medium'
                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="https://polymarket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-sm whitespace-nowrap"
          >
            {t('market.tradeOn')} →
          </a>
        </nav>
      </div>
    </header>
  )
}
