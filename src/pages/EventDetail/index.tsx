import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useMarket, useOrderBook, usePriceHistory } from '../../hooks'
import { OrderBook } from '../../components/orderbook'
import { PriceChart } from '../../components/charts'
import { formatCountdown, formatCurrency, formatPercent, getMarketUrl, formatTimestamp } from '../../utils'
import { calculateDepth, calculateDepthSkew } from '../../utils'
import { useTranslation } from '../../i18n'

type Tab = 'holders' | 'traders' | 'activity'

// Mock data for tabs
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
    const shares = Math.floor(Math.random() * 5000 + 100)
    const avgBuyPrice = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const avgSellPrice = avgBuyPrice > 0.5 ? +(avgBuyPrice + Math.random() * 0.1).toFixed(3) : +(avgBuyPrice - Math.random() * 0.1).toFixed(3)
    const value = +(shares * avgBuyPrice).toFixed(2)
    const realizedPnl = (Math.random() - 0.3) * 10000
    const unrealizedPnl = (Math.random() - 0.3) * 8000
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

const generateMockActivity = () => {
  return Array.from({ length: 15 }, (_, i) => {
    const shares = Math.floor(Math.random() * 1000 + 10)
    const price = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const now = Date.now()
    const timestamp = now - Math.floor(Math.random() * 3600000) // Within last hour
    const date = new Date(timestamp)

    return {
      id: i,
      type: ['BUY', 'SELL'][Math.floor(Math.random() * 2)],
      outcome: ['YES', 'NO'][Math.floor(Math.random() * 2)],
      shares,
      price,
      total: +(shares * price).toFixed(2),
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      timestamp: formatTimestamp(date),
      timeAgo: `${Math.floor(Math.random() * 60)}分钟前`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    }
  })
}

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('activity')
  const [selectedSubMarketId, setSelectedSubMarketId] = useState<string | null>(null)
  const { t } = useTranslation()

  // 获取市场数据
  const { data: market, isLoading: marketLoading } = useMarket(eventId)

  // 选中的子市场（如果为 null 则表示选择 "所有"）
  const selectedSubMarket = selectedSubMarketId
    ? market?.markets?.find(m => m.id === selectedSubMarketId)
    : null

  // 获取订单簿（只使用主市场的 token，子市场暂不支持订单簿）
  const tokenId = market?.clob_token_ids?.[0]
  const { data: orderBook, isLoading: orderBookLoading } = useOrderBook(tokenId)

  // 获取价格历史
  const { data: priceHistory = [] } = usePriceHistory(tokenId, '1d', 100)

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
  const traders = useMemo(() => generateMockTraders(), [])
  const activity = useMemo(() => generateMockActivity(), [])

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

  // 从订单簿计算深度
  const { bidDepth, askDepth } = orderBook
    ? calculateDepth(orderBook, 10)
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
      {/* Event Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
            {market.active ? t('common.active') : t('common.closed')}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-600 text-gray-300 capitalize">
            {market.tags[0] || t('common.other')}
          </span>
          <span className="text-gray-500 text-sm">{t('market.endDate')} {formatCountdown(market.end_date_iso)}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-100 flex-shrink-0">{market.question}</h1>

          {/* Sub-event selector */}
          {market.markets && market.markets.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 whitespace-nowrap">{t('market.subEvent')}:</span>
              <select
                value={selectedSubMarketId || ''}
                onChange={(e) => setSelectedSubMarketId(e.target.value || null)}
                className="bg-dark-700 border border-dark-600 text-gray-100 text-sm rounded-lg px-3 py-2 cursor-pointer hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[200px] max-w-[400px]"
              >
                <option value="">{t('market.allSubEvents')}</option>
                {market.markets.map((subMarket) => {
                  const yesPrice = subMarket.outcomePrices?.[0] ? parseFloat(subMarket.outcomePrices[0]) : 0
                  const noPrice = subMarket.outcomePrices?.[1] ? parseFloat(subMarket.outcomePrices[1]) : 0

                  return (
                    <option key={subMarket.id} value={subMarket.id}>
                      {subMarket.question} - YES {(yesPrice * 100).toFixed(0)}¢ / NO {(noPrice * 100).toFixed(0)}¢
                    </option>
                  )
                })}
              </select>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Layout: 60% Chart + 20% OrderBook + 20% Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-4">
        {/* Left: Price Chart (60%) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-6 card p-4"
        >
          <PriceChart
            data={chartData}
            height={450}
            multiLine={isMultiLine}
          />
        </motion.div>

        {/* Middle: OrderBook (20%) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 card p-4 pb-2"
        >
          <h2 className="text-base font-semibold text-gray-100 mb-3">{t('market.orderBook')}</h2>
          {orderBookLoading ? (
            <div className="h-[420px] flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : orderBook ? (
            <div className="h-[420px]">
              <OrderBook orderBook={orderBook} maxLevels={25} />
            </div>
          ) : (
            <div className="h-[420px] flex items-center justify-center text-gray-500 text-sm">
              {t('market.noOrderBook')}
            </div>
          )}
        </motion.div>

        {/* Right: Market Stats Grid (20%) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card p-4"
        >
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-start justify-start p-2 bg-dark-700 rounded"
                >
                  <span className="text-xs text-gray-400 mb-1 leading-tight">{stat.label}</span>
                  <span className={`text-sm font-mono font-semibold ${stat.colorClass || 'text-gray-100'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
            {/* Trade Button - at bottom */}
            <div className="mt-auto">
              <a
                href={getMarketUrl(market.market_slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full text-center block text-sm"
              >
                {t('market.tradeOn')} →
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom: Tabs Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="card"
      >
        <div className="border-b border-dark-600">
          <div className="flex gap-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-medium transition-all relative cursor-pointer active:scale-95 ${
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-200'
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
                <tr className="border-b border-dark-600 text-left">
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
                    className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors cursor-pointer"
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
                <tr className="border-b border-dark-600 text-left">
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
                {traders.map((trader, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => navigate(`/user/${trader.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-all cursor-pointer active:scale-95"
                      >
                        {trader.address}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">{trader.shares.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-100 text-sm">${trader.value.toLocaleString()}</td>
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
                <tr className="border-b border-dark-600 text-left">
                  <th className="pb-3 pr-4 text-xs font-medium text-gray-400 uppercase">{t('table.time')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase">{t('table.address')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase">{t('table.type')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.price')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.shares')}</th>
                  <th className="pb-3 px-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.total')}</th>
                  <th className="pb-3 pl-2 text-xs font-medium text-gray-400 uppercase text-right">{t('table.txHash')}</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((trade) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: trade.id * 0.02 }}
                    className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="text-sm text-gray-300">{trade.timestamp}</div>
                      <div className="text-xs text-gray-500">{trade.timeAgo}</div>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => navigate(`/user/${trade.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-all cursor-pointer active:scale-95"
                      >
                        {trade.address}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        trade.type === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {trade.type === 'BUY' ? t('table.buy') : t('table.sell')} {trade.outcome === 'YES' ? t('table.yes') : t('table.no')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">${trade.price.toFixed(3)}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-300 text-sm">{trade.shares.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono text-gray-100 text-sm">${trade.total.toFixed(2)}</td>
                    <td className="py-3 pl-2 text-right">
                      <a
                        href={`https://polygonscan.com/tx/${trade.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-mono text-xs transition-colors inline-block"
                      >
                        {trade.txHash.slice(0, 10)}...{trade.txHash.slice(-8)}
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
