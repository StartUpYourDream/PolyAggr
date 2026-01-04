import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarkets } from '../../hooks'
import { formatCurrency, formatPercent, formatCountdown, MARKET_CATEGORIES } from '../../utils'
import type { Market } from '../../types'
import { useTranslation } from '../../i18n'

type SortField = 'volume' | 'oi' | 'oiChange' | 'bid' | 'ask' | 'change1h' | 'change24h' | 'name'
type SortOrder = 'asc' | 'desc'

// 计算市场的扩展数据
function calculateMarketMetrics(market: Market) {
  const yesOutcome = market.outcomes.find(o => o.id.includes('yes'))
  const noOutcome = market.outcomes.find(o => o.id.includes('no'))

  const yesPrice = yesOutcome ? parseFloat(yesOutcome.price) : 0.5
  const noPrice = noOutcome ? parseFloat(noOutcome.price) : 0.5

  const volume24h = parseFloat(market.volume24hr) || 0
  const openInterest = parseFloat(market.liquidity) || 0

  // 简化计算 - 实际应该从订单簿获取
  const bidDepth = openInterest * 0.3 * (0.8 + Math.random() * 0.4)
  const askDepth = openInterest * 0.3 * (0.8 + Math.random() * 0.4)
  const depthSkew = (bidDepth - askDepth) / (bidDepth + askDepth || 1)

  const priceChange1h = yesOutcome?.price_change_percent || (Math.random() * 10 - 5)
  const priceChange24h = yesOutcome?.price_change_percent || (Math.random() * 20 - 10)

  return {
    id: market.id,
    name: market.question,
    category: market.tags[0] || 'other',
    yesPrice,
    noPrice,
    volume24h,
    openInterest,
    oiChange24h: Math.random() * 40 - 20, // Mock
    bidDepth,
    askDepth,
    depthSkew,
    priceChange1h,
    priceChange6h: (priceChange1h + priceChange24h) / 2,
    priceChange24h,
    endDate: market.end_date_iso,
    slug: market.market_slug,
  }
}

export function Trending() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortField, setSortField] = useState<SortField>('volume')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // 获取市场数据
  const { data: markets, isLoading, error } = useMarkets({ limit: 100, active: true })

  // 计算扩展数据并排序过滤
  const processedMarkets = useMemo(() => {
    if (!markets) return []

    let filtered = markets.map(calculateMarketMetrics)

    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory)
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortField) {
        case 'volume':
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case 'oi':
          aValue = a.openInterest
          bValue = b.openInterest
          break
        case 'oiChange':
          aValue = a.oiChange24h
          bValue = b.oiChange24h
          break
        case 'bid':
          aValue = a.bidDepth
          bValue = b.bidDepth
          break
        case 'ask':
          aValue = a.askDepth
          bValue = b.askDepth
          break
        case 'change1h':
          aValue = a.priceChange1h
          bValue = b.priceChange1h
          break
        case 'change24h':
          aValue = a.priceChange24h
          bValue = b.priceChange24h
          break
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        default:
          aValue = a.volume24h
          bValue = b.volume24h
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [markets, selectedCategory, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  if (error) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-8 text-center">
          <div className="text-danger text-lg mb-2">{t('trending.loadError')}</div>
          <div className="text-gray-400">
            {error instanceof Error ? error.message : t('trending.unknownError')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t('trending.title')}</h1>
        <p className="text-gray-400">
          {t('trending.description')}
          {processedMarkets.length > 0 && ` · ${processedMarkets.length} ${t('trending.markets')}`}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="card p-4 mb-6"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400">{t('trending.category')}：</span>
          <div className="flex gap-2 flex-wrap">
            {MARKET_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 text-sm rounded-lg transition-all cursor-pointer active:scale-95 ${
                  selectedCategory === cat.value
                    ? 'bg-primary !text-white font-medium'
                    : 'bg-dark-700 dark:bg-dark-700 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-300 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-gray-400 mt-4">{t('trending.loadingMarkets')}</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && processedMarkets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600 dark:border-dark-600 light:border-gray-200 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('trending.event')}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t('trending.category')}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                    {t('trending.yes')}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                    {t('trending.no')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('volume')}
                  >
                    {t('stats.volume24h')} {sortField === 'volume' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('oi')}
                  >
                    {t('stats.openInterest')} {sortField === 'oi' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('oiChange')}
                  >
                    {t('trending.oiChange')} {sortField === 'oiChange' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('bid')}
                  >
                    {t('stats.bidDepth')} {sortField === 'bid' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('ask')}
                  >
                    {t('stats.askDepth')} {sortField === 'ask' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('change1h')}
                  >
                    {t('trending.change1h')} {sortField === 'change1h' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('change24h')}
                  >
                    {t('trending.change24h')} {sortField === 'change24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedMarkets.map((market, index) => (
                  <motion.tr
                    key={market.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 table-row-hover"
                    onClick={() => navigate(`/event/${market.slug}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="max-w-[300px]">
                        <p className="text-gray-100 font-medium truncate">{market.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('trending.endsAt')} {formatCountdown(market.endDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-600 dark:bg-dark-600 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 capitalize">
                        {market.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-success font-mono tabular-nums">
                        {(market.yesPrice * 100).toFixed(1)}¢
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-danger font-mono tabular-nums">
                        {(market.noPrice * 100).toFixed(1)}¢
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300 font-mono tabular-nums">
                      {formatCurrency(market.volume24h)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300 font-mono tabular-nums">
                      {formatCurrency(market.openInterest)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-mono tabular-nums ${
                          market.oiChange24h >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatPercent(market.oiChange24h)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300 font-mono tabular-nums">
                      {formatCurrency(market.bidDepth)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300 font-mono tabular-nums">
                      {formatCurrency(market.askDepth)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-mono tabular-nums ${
                          market.priceChange1h >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatPercent(market.priceChange1h)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-mono tabular-nums ${
                          market.priceChange24h >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatPercent(market.priceChange24h)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && processedMarkets.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-gray-400">{t('trending.noMarketsFound')}</div>
        </div>
      )}
    </div>
  )
}
