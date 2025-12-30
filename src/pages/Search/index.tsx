import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useMarkets } from '../../hooks'
import { formatCurrency, formatPercent } from '../../utils'

export function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const navigate = useNavigate()

  // Fetch all markets for searching
  const { data: markets = [], isLoading } = useMarkets({ limit: 200 })

  // Filter markets by query
  const filteredMarkets = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return markets
      .filter(market =>
        market.question.toLowerCase().includes(lowerQuery) ||
        market.description.toLowerCase().includes(lowerQuery) ||
        market.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 10) // Limit to 10 results
  }, [markets, query])

  // Check if query looks like an address (starts with 0x and has hex chars)
  const isAddressQuery = useMemo(() => {
    return /^0x[a-fA-F0-9]{4,}$/.test(query)
  }, [query])

  // Mock user search (in real app, would call user search API)
  const matchedUsers = useMemo(() => {
    if (!isAddressQuery) return []
    // In a real app, this would search a user database
    // For now, just return the queried address if it's valid
    return [
      {
        address: query,
        balance: Math.random() * 200000 + 50000,
        pnl: (Math.random() - 0.4) * 100000,
        roi: (Math.random() - 0.3) * 150,
      }
    ]
  }, [query, isAddressQuery])

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Search Results
        </h1>
        <p className="text-gray-400">
          {query ? `Showing results for "${query}"` : 'Enter a search query'}
        </p>
      </motion.div>

      {query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Events Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100">Events</h2>
              <span className="text-sm text-gray-400">
                {isLoading ? 'Searching...' : `${filteredMarkets.length} results`}
              </span>
            </div>

            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredMarkets.length > 0 ? (
              <div className="space-y-3">
                {filteredMarkets.map((market, index) => {
                  const yesOutcome = market.outcomes.find(o => o.id.includes('yes'))
                  const yesPrice = yesOutcome ? parseFloat(yesOutcome.price) : 0.5
                  const volume24h = parseFloat(market.volume24hr) || 0

                  return (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/event/${market.id}`)}
                      className="p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors cursor-pointer border border-dark-600 hover:border-primary/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-dark-600 flex items-center justify-center text-xl flex-shrink-0">
                          {market.icon ? (
                            <img src={market.icon} alt="" className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            '📊'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-100 font-medium mb-1 truncate">
                            {market.question}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-success font-mono">
                              YES {(yesPrice * 100).toFixed(1)}¢
                            </span>
                            <span className="text-gray-400">
                              Vol {formatCurrency(volume24h)}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-dark-600 text-gray-300 capitalize">
                              {market.tags[0] || 'Other'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-gray-500">
                No events found matching "{query}"
              </div>
            )}
          </div>

          {/* Users Section */}
          {isAddressQuery && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Users</h2>
                <span className="text-sm text-gray-400">
                  {matchedUsers.length} result{matchedUsers.length !== 1 ? 's' : ''}
                </span>
              </div>

              {matchedUsers.length > 0 ? (
                <div className="space-y-3">
                  {matchedUsers.map((user, index) => (
                    <motion.div
                      key={user.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/user/${user.address}`)}
                      className="p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors cursor-pointer border border-dark-600 hover:border-primary/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xl font-bold flex-shrink-0">
                          {user.address.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-100 font-medium mb-1 font-mono">
                            {user.address.slice(0, 8)}...{user.address.slice(-6)}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">
                              Balance {formatCurrency(user.balance)}
                            </span>
                            <span className={user.pnl >= 0 ? 'text-success' : 'text-danger'}>
                              P&L {user.pnl >= 0 ? '+' : ''}{formatCurrency(user.pnl)}
                            </span>
                            <span className={user.roi >= 0 ? 'text-success' : 'text-danger'}>
                              ROI {formatPercent(user.roi)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}

          {/* Show hint for address search */}
          {!isAddressQuery && query.length > 0 && (
            <div className="card p-4 bg-dark-700/50 border border-dark-600">
              <p className="text-sm text-gray-400">
                💡 <span className="text-gray-300">Tip:</span> To search for users, enter a wallet address starting with "0x"
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-12 text-center"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Start searching
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Use the search bar above to find prediction markets or user profiles.
            You can search by event name, keywords, or wallet addresses.
          </p>
        </motion.div>
      )}
    </div>
  )
}
