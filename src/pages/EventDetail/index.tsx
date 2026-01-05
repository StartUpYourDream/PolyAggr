import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { useMarket, useOrderBook, usePriceHistory } from '../../hooks'
import { OrderBook } from '../../components/orderbook'
import { PriceChart } from '../../components/charts'
import { formatCurrency, formatPercent, formatTimestamp } from '../../utils'
import { calculateDepth, calculateDepthSkew } from '../../utils'
import { useTranslation } from '../../i18n'

type Tab = 'holders' | 'traders' | 'activity'

// Mock data generators
const generateMockHolders = () => {
  return Array.from({ length: 10 }, () => {
    const shares = Math.floor(Math.random() * 10000 + 100)
    const avgBuyPrice = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const avgSellPrice = avgBuyPrice > 0.5 ? +(avgBuyPrice + Math.random() * 0.1).toFixed(3) : +(avgBuyPrice - Math.random() * 0.1).toFixed(3)
    const value = +(shares * avgBuyPrice).toFixed(2)
    const realizedPnl = (Math.random() - 0.4) * 5000
    const unrealizedPnl = (Math.random() - 0.4) * 8000
    const totalInvested = value - unrealizedPnl

    return {
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      shares,
      value,
      avgBuyPrice,
      avgSellPrice,
      realizedPnl,
      unrealizedPnl,
      realizedRoi: totalInvested > 0 ? (realizedPnl / totalInvested) * 100 : 0,
      unrealizedRoi: totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0,
    }
  })
}

const generateMockTraders = () => {
  return Array.from({ length: 10 }, () => {
    const buyCount = Math.floor(Math.random() * 20 + 1)
    const sellCount = Math.floor(Math.random() * 15 + 1)
    const avgBuyPrice = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const avgSellPrice = avgBuyPrice > 0.5 ? +(avgBuyPrice + Math.random() * 0.1).toFixed(3) : +(avgBuyPrice - Math.random() * 0.1).toFixed(3)
    const realizedPnl = (Math.random() - 0.3) * 10000
    const unrealizedPnl = (Math.random() - 0.3) * 8000
    const totalInvested = Math.abs(realizedPnl) + Math.abs(unrealizedPnl)

    return {
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      buyCount,
      sellCount,
      avgBuyPrice,
      avgSellPrice,
      realizedPnl,
      unrealizedPnl,
      realizedRoi: totalInvested > 0 ? (realizedPnl / totalInvested) * 100 : 0,
      unrealizedRoi: totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0,
    }
  })
}

const generateMockActivity = () => {
  return Array.from({ length: 15 }, (_, i) => {
    const shares = Math.floor(Math.random() * 1000 + 10)
    const price = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const now = Date.now()
    const timestamp = now - Math.floor(Math.random() * 3600000) // Within last hour
    const minutesAgo = Math.floor(Math.random() * 60)

    return {
      id: i,
      type: ['buy', 'sell'][Math.floor(Math.random() * 2)] as 'buy' | 'sell',
      outcome: ['yes', 'no'][Math.floor(Math.random() * 2)] as 'yes' | 'no',
      shares,
      price,
      total: +(shares * price).toFixed(2),
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      timestamp,
      timeAgo: `${minutesAgo}${minutesAgo > 0 ? '分钟前' : '刚刚'}`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    }
  })
}

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('activity')
  const [selectedSubMarketId, setSelectedSubMarketId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string>('')
  const { t } = useTranslation()

  // 获取市场数据
  const { data: market, isLoading: marketLoading } = useMarket(eventId)

  // 选中的子市场（如果为 null 则表示选择 "所有"）
  const selectedSubMarket = selectedSubMarketId
    ? market?.markets?.find(m => m.id === selectedSubMarketId)
    : null

  // 获取订单簿（支持多个 outcome 的订单簿）
  const yesTokenId = market?.clob_token_ids?.[0]
  const noTokenId = market?.clob_token_ids?.[1]
  const drawTokenId = market?.clob_token_ids?.[2] // DRAW token (如果存在)

  const { data: yesOrderBook, isLoading: yesOrderBookLoading } = useOrderBook(yesTokenId)
  const { data: noOrderBook, isLoading: noOrderBookLoading } = useOrderBook(noTokenId)
  const { data: drawOrderBook, isLoading: drawOrderBookLoading } = useOrderBook(drawTokenId)

  // 获取价格历史（使用 YES token 的价格历史）
  const { data: priceHistory = [] } = usePriceHistory(yesTokenId, '1d', 100)

  // 准备图表数据
  const { chartData, isMultiLine } = useMemo(() => {
    // 如果选择了"所有"且有子市场，生成多条折线数据
    if (selectedSubMarketId === null && market?.markets && market.markets.length > 0) {
      // 为每个子市场生成模拟价格历史
      const multiLineData = market.markets.map((subMarket) => {
        const basePrice = subMarket.outcomePrices?.[0]
          ? parseFloat(subMarket.outcomePrices[0])
          : 0.3 + Math.random() * 0.4

        // 生成该子市场的价格历史（基于主市场的时间戳）
        return priceHistory.map(point => ({
          t: point.t,
          p: basePrice + (Math.random() - 0.5) * 0.15, // 在基础价格上下波动
        }))
      })

      return { chartData: multiLineData, isMultiLine: true }
    } else {
      // 单个市场模式
      return { chartData: priceHistory, isMultiLine: false }
    }
  }, [selectedSubMarketId, market?.markets, priceHistory])

  // Mock tab data
  const holders = useMemo(() => generateMockHolders(), [])
  const topTraders = useMemo(() => generateMockTraders(), [])
  const activities = useMemo(() => generateMockActivity(), [])

  // Countdown timer - updates every second
  useEffect(() => {
    if (!market?.end_date_iso) return

    const updateCountdown = () => {
      const endTime = new Date(market.end_date_iso).getTime()
      const now = Date.now()
      const diff = endTime - now

      if (diff <= 0) {
        setCountdown('00:00:00:00')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown(`${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [market?.end_date_iso])

  // Calculate event status
  const getEventStatus = () => {
    if (!market) return 'active'

    // Mock logic for different statuses - in real app this would come from API
    const endTime = market.end_date_iso ? new Date(market.end_date_iso).getTime() : Date.now() + 86400000
    const now = Date.now()

    // For demo: randomly assign status based on market state
    if (endTime < now) {
      // Event ended - could be disputed, under review, or resolved
      const rand = Math.random()
      if (rand < 0.1) return 'disputed'
      if (rand < 0.2) return 'review'
      return 'ended'
    }

    return 'active'
  }

  const eventStatus = getEventStatus()
  const statusConfig = {
    active: { label: t('market.statusActive'), colorClass: 'bg-success/20 text-success border-success/30' },
    ended: { label: t('market.statusEnded'), colorClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    disputed: { label: t('market.statusDisputed'), colorClass: 'bg-danger/20 text-danger border-danger/30' },
    review: { label: t('market.statusReview'), colorClass: 'bg-primary/20 text-primary border-primary/30' },
  }

  if (marketLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-gray-400 mt-4">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="text-danger text-lg mb-2">{t('market.notFound')}</div>
          <div className="text-gray-400">{t('market.notFoundDesc')}</div>
        </div>
      </div>
    )
  }

  // 计算市场指标（使用选中的子市场或主市场）
  const currentMarket = selectedSubMarket || market
  const yesOutcome = currentMarket.outcomes.find(o => o.id.includes('yes'))
  const noOutcome = currentMarket.outcomes.find(o => o.id.includes('no'))

  const yesPrice = yesOutcome ? parseFloat(yesOutcome.price) : 0.5
  const noPrice = noOutcome ? parseFloat(noOutcome.price) : 0.5

  const volume24h = selectedSubMarket
    ? parseFloat(selectedSubMarket.volume) || 0
    : parseFloat(market.volume24hr) || 0
  const openInterest = parseFloat(market.liquidity) || 0

  // 从订单簿计算深度（使用 YES 订单簿）
  const { bidDepth, askDepth } = yesOrderBook
    ? calculateDepth(yesOrderBook, 10)
    : { bidDepth: 0, askDepth: 0 }

  const depthSkew = calculateDepthSkew(bidDepth, askDepth)

  const priceChange24h = yesOutcome?.price_change_percent || 0

  // Market stats 数据
  const stats = [
    { label: t('stats.volume24h'), value: formatCurrency(volume24h) },
    { label: t('stats.openInterest'), value: formatCurrency(openInterest) },
    { label: t('stats.bidDepth'), value: formatCurrency(bidDepth), colorClass: 'text-success' },
    { label: t('stats.askDepth'), value: formatCurrency(askDepth), colorClass: 'text-danger' },
    { label: t('stats.depthSkew'), value: formatPercent(depthSkew * 100), colorClass: depthSkew >= 0 ? 'text-success' : 'text-danger' },
    { label: t('stats.priceChange24h'), value: formatPercent(priceChange24h), colorClass: priceChange24h >= 0 ? 'text-success' : 'text-danger' },
    { label: t('stats.yesPrice'), value: `${(yesPrice * 100).toFixed(1)}¢`, colorClass: 'text-success' },
    { label: t('stats.noPrice'), value: `${(noPrice * 100).toFixed(1)}¢`, colorClass: 'text-danger' },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'activity', label: t('tabs.activity') },
    { key: 'holders', label: t('tabs.holders') },
    { key: 'traders', label: t('tabs.traders') },
  ]

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      {/* Top Section: Avatar + Title + Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">P</span>
          </div>

          {/* Title and Tags */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              {market.question}
            </h1>
            <div className="text-sm text-gray-400 mb-3">
              {selectedSubMarket ? selectedSubMarket.question : market.question}
            </div>

            <div className="flex items-center gap-3">
              {/* Countdown Timer */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-dark-700 dark:bg-dark-700 light:bg-gray-100 border border-dark-600 dark:border-dark-600 light:border-gray-300">
                <span className="text-xs text-gray-400">{t('market.endTime')}:</span>
                <span className="text-xs font-mono font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 tabular-nums">
                  {countdown || '00:00:00:00'}
                </span>
              </div>

              {/* Event Status */}
              <div className={`px-3 py-1 rounded-md text-xs font-medium border ${statusConfig[eventStatus as keyof typeof statusConfig]?.colorClass || statusConfig.active.colorClass}`}>
                {statusConfig[eventStatus as keyof typeof statusConfig]?.label || statusConfig.active.label}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content: 3 columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_480px] gap-4 mb-4">
        {/* Left Panel: Sub-events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <h3 className="text-sm font-semibold text-gray-200 mb-3">{t('market.subEvents')}</h3>

          {/* Sub-event buttons */}
          <div className="space-y-2">
            {market.markets && market.markets.length > 0 ? (
              <>
                <button
                  onClick={() => setSelectedSubMarketId(null)}
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-all cursor-pointer active:scale-95 text-left ${
                    selectedSubMarketId === null
                      ? 'bg-primary !text-white font-medium'
                      : 'bg-dark-700 dark:bg-dark-700 light:bg-gray-100 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-200'
                  }`}
                >
                  {t('market.allSubEvents')}
                </button>
                {market.markets.slice(0, 6).map((subMarket, idx) => (
                  <button
                    key={subMarket.id}
                    onClick={() => setSelectedSubMarketId(subMarket.id)}
                    className={`w-full px-3 py-2 text-sm rounded-lg transition-all cursor-pointer active:scale-95 text-left ${
                      selectedSubMarketId === subMarket.id
                        ? 'bg-primary !text-white font-medium'
                        : 'bg-dark-700 dark:bg-dark-700 light:bg-gray-100 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-200'
                    }`}
                  >
                    {t('market.subEvent')} {idx + 1}
                  </button>
                ))}
              </>
            ) : (
              <div className="text-xs text-gray-500 text-center py-4">
                {t('common.noData')}
              </div>
            )}
          </div>
        </motion.div>

        {/* Middle Panel: Price Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-4"
        >
          <PriceChart
            data={chartData}
            height={400}
            multiLine={isMultiLine}
          />
        </motion.div>

        {/* Right Panel: Event Description + Data Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Event Description */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">{t('market.description')}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('market.descriptionPlaceholder')}
            </p>
          </div>

          {/* Data Overview */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">{t('market.dataOverview')}</h3>
            <div className="grid grid-cols-4 gap-2">
              {stats.slice(0, 4).map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-2 bg-dark-700 dark:bg-dark-700 light:bg-gray-100 rounded border border-dark-600 dark:border-dark-600 light:border-gray-200"
                >
                  <span className="text-xs text-gray-400 mb-1 text-center leading-tight">{stat.label}</span>
                  <span className={`text-sm font-mono font-semibold ${stat.colorClass || 'text-gray-100'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order Books Section: YES, DRAW (conditional), and NO */}
      <div className={`grid grid-cols-1 gap-4 mb-4 ${market.outcomes.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {/* YES Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="card p-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-3">
            {/* YES OrderBook */}
            <div>
              <h2 className="text-sm font-semibold text-success mb-3">{t('market.yesOrderBook')}</h2>
              {yesOrderBookLoading ? (
                <div className="h-[340px] flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : yesOrderBook ? (
                <div className="h-[340px]">
                  <OrderBook orderBook={yesOrderBook} maxLevels={20} />
                </div>
              ) : (
                <div className="h-[340px] flex items-center justify-center text-gray-500 text-sm">
                  {t('market.noOrderBook')}
                </div>
              )}
            </div>

            {/* Yes Data Stats */}
            <div className="w-full">
              <h3 className="text-sm font-semibold text-gray-200 mb-3">{t('market.yesData')}</h3>
              <div className={`grid gap-2 ${market.outcomes.length === 3 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {stats.slice(0, market.outcomes.length === 3 ? 6 : 8).map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-2 bg-dark-700 dark:bg-dark-700 light:bg-gray-100 rounded border border-dark-600 dark:border-dark-600 light:border-gray-200 h-16"
                  >
                    <span className="text-xs text-gray-400 mb-1 text-center leading-tight">{stat.label}</span>
                    <span className={`text-xs font-mono font-semibold ${stat.colorClass || 'text-gray-100'}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* DRAW Section - Conditional rendering based on outcomes length */}
        {market.outcomes.length === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.275 }}
            className="card p-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-3">
              {/* DRAW OrderBook */}
              <div>
                <h2 className="text-sm font-semibold text-primary mb-3">{t('market.drawOrderBook')}</h2>
                {drawOrderBookLoading ? (
                  <div className="h-[340px] flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : drawOrderBook ? (
                  <div className="h-[340px]">
                    <OrderBook orderBook={drawOrderBook} maxLevels={20} />
                  </div>
                ) : (
                  <div className="h-[340px] flex items-center justify-center text-gray-500 text-sm">
                    {t('market.noOrderBook')}
                  </div>
                )}
              </div>

              {/* Draw Data Stats */}
              <div className="w-full">
                <h3 className="text-sm font-semibold text-gray-200 mb-3">{t('market.drawData')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {stats.slice(0, 6).map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center p-2 bg-dark-700 dark:bg-dark-700 light:bg-gray-100 rounded border border-dark-600 dark:border-dark-600 light:border-gray-200 h-16"
                    >
                      <span className="text-xs text-gray-400 mb-1 text-center leading-tight">{stat.label}</span>
                      <span className={`text-xs font-mono font-semibold ${stat.colorClass || 'text-gray-100'}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* NO Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-3">
            {/* NO OrderBook */}
            <div>
              <h2 className="text-sm font-semibold text-danger mb-3">{t('market.noOrderBookTitle')}</h2>
              {noOrderBookLoading ? (
                <div className="h-[340px] flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : noOrderBook ? (
                <div className="h-[340px]">
                  <OrderBook orderBook={noOrderBook} maxLevels={20} />
                </div>
              ) : (
                <div className="h-[340px] flex items-center justify-center text-gray-500 text-sm">
                  {t('market.noOrderBook')}
                </div>
              )}
            </div>

            {/* No Data Stats */}
            <div className="w-full">
              <h3 className="text-sm font-semibold text-gray-200 mb-3">{t('market.noData')}</h3>
              <div className={`grid gap-2 ${market.outcomes.length === 3 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {stats.slice(0, market.outcomes.length === 3 ? 6 : 8).map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-2 bg-dark-700 dark:bg-dark-700 light:bg-gray-100 rounded border border-dark-600 dark:border-dark-600 light:border-gray-200 h-16"
                  >
                    <span className="text-xs text-gray-400 mb-1 text-center leading-tight">{stat.label}</span>
                    <span className={`text-xs font-mono font-semibold ${stat.colorClass || 'text-gray-100'}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom: Tabs Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="card"
      >
        <div className="border-b border-dark-600 dark:border-dark-600 light:border-gray-200">
          <div className="flex gap-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-medium transition-all relative cursor-pointer active:scale-95 ${
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 overflow-x-auto">
          {activeTab === 'holders' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600 dark:border-dark-600 light:border-gray-200 text-left">
                  <th className="pb-3 pr-4 text-xs font-medium text-gray-400 uppercase">{t('table.address')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.shares')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.value')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.avgBuyPrice')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.avgSellPrice')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.realizedPnl')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.realizedRoi')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.unrealizedPnl')}</th>
                  <th className="pb-3 pl-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.unrealizedRoi')}</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((holder, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 hover:bg-dark-700/30 dark:hover:bg-dark-700/30 light:hover:bg-gray-100/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => navigate(`/user/${holder.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-all cursor-pointer active:scale-95"
                      >
                        {holder.address}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">{holder.shares.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-100 text-sm">${holder.value.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">${holder.avgBuyPrice.toFixed(3)}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">${holder.avgSellPrice.toFixed(3)}</td>
                    <td className={`py-3 px-2 text-right font-mono text-sm ${holder.realizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {holder.realizedPnl >= 0 ? '+' : ''}${holder.realizedPnl.toFixed(2)}
                    </td>
                    <td className={`py-3 px-2 text-right font-mono text-sm ${holder.realizedRoi >= 0 ? 'text-success' : 'text-danger'}`}>
                      {holder.realizedRoi >= 0 ? '+' : ''}{holder.realizedRoi.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-2 text-right font-mono text-sm ${holder.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {holder.unrealizedPnl >= 0 ? '+' : ''}${holder.unrealizedPnl.toFixed(2)}
                    </td>
                    <td className={`py-3 pl-2 text-right font-mono text-sm ${holder.unrealizedRoi >= 0 ? 'text-success' : 'text-danger'}`}>
                      {holder.unrealizedRoi >= 0 ? '+' : ''}{holder.unrealizedRoi.toFixed(2)}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'traders' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600 dark:border-dark-600 light:border-gray-200 text-left">
                  <th className="pb-3 pr-4 text-xs font-medium text-gray-400 uppercase">{t('table.address')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.buyCount')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.sellCount')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.avgBuyPrice')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.avgSellPrice')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.realizedPnl')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.realizedRoi')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.unrealizedPnl')}</th>
                  <th className="pb-3 pl-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.unrealizedRoi')}</th>
                </tr>
              </thead>
              <tbody>
                {topTraders.map((trader, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 hover:bg-dark-700/30 dark:hover:bg-dark-700/30 light:hover:bg-gray-100/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => navigate(`/user/${trader.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-all cursor-pointer active:scale-95"
                      >
                        {trader.address}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">{trader.buyCount}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">{trader.sellCount}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">${trader.avgBuyPrice.toFixed(3)}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">${trader.avgSellPrice.toFixed(3)}</td>
                    <td className={`py-3 px-2 text-right font-mono text-sm ${trader.realizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trader.realizedPnl >= 0 ? '+' : ''}${trader.realizedPnl.toFixed(2)}
                    </td>
                    <td className={`py-3 px-2 text-right font-mono text-sm ${trader.realizedRoi >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trader.realizedRoi >= 0 ? '+' : ''}{trader.realizedRoi.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-2 text-right font-mono text-sm ${trader.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trader.unrealizedPnl >= 0 ? '+' : ''}${trader.unrealizedPnl.toFixed(2)}
                    </td>
                    <td className={`py-3 pl-2 text-right font-mono text-sm ${trader.unrealizedRoi >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trader.unrealizedRoi >= 0 ? '+' : ''}{trader.unrealizedRoi.toFixed(2)}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'activity' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600 dark:border-dark-600 light:border-gray-200 text-left">
                  <th className="pb-3 pr-4 text-xs font-medium text-gray-400 uppercase">{t('table.time')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase">{t('table.address')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-center">{t('table.type')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.shares')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.price')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.total')}</th>
                  <th className="pb-3 pl-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.txHash')}</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 hover:bg-dark-700/30 dark:hover:bg-dark-700/30 light:hover:bg-gray-100/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4 text-gray-400 text-xs font-mono">{formatTimestamp(activity.timestamp)}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => navigate(`/user/${activity.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-all cursor-pointer active:scale-95"
                      >
                        {activity.address}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          activity.type === 'buy'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}>
                          {activity.type === 'buy' ? t('table.buy') : t('table.sell')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          activity.outcome === 'yes'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {activity.outcome === 'yes' ? t('table.yes') : t('table.no')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">{activity.shares.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-100 text-sm">${activity.price.toFixed(3)}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-100 text-sm">${activity.total.toFixed(2)}</td>
                    <td className="py-3 pl-2 text-right">
                      <a
                        href={`https://polygonscan.com/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-primary/80 font-mono text-xs transition-all"
                      >
                        {activity.txHash.slice(0, 10)}...
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
