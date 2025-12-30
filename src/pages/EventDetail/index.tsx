import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useMarket, useOrderBook, usePriceHistory } from '../../hooks'
import { OrderBook } from '../../components/orderbook'
import { GridStats } from '../../components/common'
import { PriceChart } from '../../components/charts'
import { formatCountdown, formatCurrency, formatPercent, getMarketUrl } from '../../utils'
import { calculateDepth, calculateDepthSkew } from '../../utils'

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
      timestamp: date.toLocaleString(),
      timeAgo: `${Math.floor(Math.random() * 60)}m ago`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    }
  })
}

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('holders')

  // 获取市场数据
  const { data: market, isLoading: marketLoading } = useMarket(eventId)

  // 获取订单簿（使用第一个 token）
  const tokenId = market?.clob_token_ids?.[0]
  const { data: orderBook, isLoading: orderBookLoading } = useOrderBook(tokenId)

  // 获取价格历史
  const { data: priceHistory = [] } = usePriceHistory(tokenId, '1d', 100)

  // Mock tab data
  const holders = useMemo(() => generateMockHolders(), [])
  const traders = useMemo(() => generateMockTraders(), [])
  const activity = useMemo(() => generateMockActivity(), [])

  if (marketLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-gray-400 mt-4">Loading market...</div>
        </div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="text-danger text-lg mb-2">Market not found</div>
          <div className="text-gray-400">The market you're looking for doesn't exist</div>
        </div>
      </div>
    )
  }

  // 计算市场指标
  const yesOutcome = market.outcomes.find(o => o.id.includes('yes'))
  const noOutcome = market.outcomes.find(o => o.id.includes('no'))

  const yesPrice = yesOutcome ? parseFloat(yesOutcome.price) : 0.5
  const noPrice = noOutcome ? parseFloat(noOutcome.price) : 0.5

  const volume24h = parseFloat(market.volume24hr) || 0
  const openInterest = parseFloat(market.liquidity) || 0

  // 从订单簿计算深度
  const { bidDepth, askDepth } = orderBook
    ? calculateDepth(orderBook, 10)
    : { bidDepth: 0, askDepth: 0 }

  const depthSkew = calculateDepthSkew(bidDepth, askDepth)

  const priceChange24h = yesOutcome?.price_change_percent || 0

  // Market stats 数据 (格栅样式)
  const stats = [
    { label: '24h Volume', value: volume24h },
    { label: 'Open Interest', value: openInterest },
    { label: 'Bid Depth', value: formatCurrency(bidDepth), colorClass: 'text-success' },
    { label: 'Ask Depth', value: formatCurrency(askDepth), colorClass: 'text-danger' },
    { label: 'Depth Skew', value: formatPercent(depthSkew * 100), colorClass: depthSkew >= 0 ? 'text-success' : 'text-danger' },
    { label: '24h Change', value: formatPercent(priceChange24h), colorClass: priceChange24h >= 0 ? 'text-success' : 'text-danger' },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'holders', label: 'Holders' },
    { key: 'traders', label: 'Top Traders' },
    { key: 'activity', label: 'Activity' },
  ]

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      {/* Event Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-xl bg-dark-600 flex items-center justify-center text-3xl flex-shrink-0">
            {market.icon ? (
              <img src={market.icon} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              '📊'
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                {market.active ? 'Active' : 'Closed'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-600 text-gray-300 capitalize">
                {market.tags[0] || 'Other'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">{market.question}</h1>
            <p className="text-gray-400 text-sm mb-4">{market.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Ends in </span>
                <span className="text-gray-100 font-medium">
                  {formatCountdown(market.end_date_iso)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">YES </span>
                <span className="text-success font-mono">{(yesPrice * 100).toFixed(1)}¢</span>
              </div>
              <div>
                <span className="text-gray-500">NO </span>
                <span className="text-danger font-mono">{(noPrice * 100).toFixed(1)}¢</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid - Three Columns: 50% + 20% + 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-6">
        {/* Left: Price Chart (50%) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 card p-6"
        >
          <PriceChart data={priceHistory} height={500} />
        </motion.div>

        {/* Middle: OrderBook (20%) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 card p-4"
        >
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Order Book</h2>
          {orderBookLoading ? (
            <div className="h-[450px] flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : orderBook ? (
            <div className="h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">
              <OrderBook orderBook={orderBook} maxLevels={15} />
            </div>
          ) : (
            <div className="h-[450px] flex items-center justify-center text-gray-500 text-sm">
              No order book data
            </div>
          )}
        </motion.div>

        {/* Right: Market Stats (30%) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Market Stats</h2>
          <GridStats stats={stats} columns={3} />
          <a
            href={getMarketUrl(market.market_slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full text-center block mt-6"
          >
            Trade on Polymarket →
          </a>
        </motion.div>
      </div>

      {/* Bottom Tabs Section */}
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
                className={`py-4 text-sm font-medium transition-colors relative ${
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
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase">Address</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Shares</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Value</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Avg Buy</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Avg Sell</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Realized P&L</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((holder, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/user/${holder.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-colors"
                      >
                        {holder.address}
                      </button>
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">{holder.shares.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-gray-100">${holder.value.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-gray-300">${holder.avgBuyPrice.toFixed(3)}</td>
                    <td className="py-3 text-right font-mono text-gray-300">${holder.avgSellPrice.toFixed(3)}</td>
                    <td className={`py-3 text-right font-mono ${holder.realizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div>{holder.realizedPnl >= 0 ? '+' : ''}${holder.realizedPnl.toFixed(2)}</div>
                      <div className="text-xs">({holder.realizedRoi >= 0 ? '+' : ''}{holder.realizedRoi.toFixed(2)}%)</div>
                    </td>
                    <td className={`py-3 text-right font-mono ${holder.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div>{holder.unrealizedPnl >= 0 ? '+' : ''}${holder.unrealizedPnl.toFixed(2)}</div>
                      <div className="text-xs">({holder.unrealizedRoi >= 0 ? '+' : ''}{holder.unrealizedRoi.toFixed(2)}%)</div>
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
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase">Address</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Shares</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Value</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Avg Buy</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Avg Sell</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Realized P&L</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody>
                {traders.map((trader, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/user/${trader.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-colors"
                      >
                        {trader.address}
                      </button>
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">{trader.shares.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-gray-100">${trader.value.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-gray-300">${trader.avgBuyPrice.toFixed(3)}</td>
                    <td className="py-3 text-right font-mono text-gray-300">${trader.avgSellPrice.toFixed(3)}</td>
                    <td className={`py-3 text-right font-mono ${trader.realizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div>{trader.realizedPnl >= 0 ? '+' : ''}${trader.realizedPnl.toFixed(2)}</div>
                      <div className="text-xs">({trader.realizedRoi >= 0 ? '+' : ''}{trader.realizedRoi.toFixed(2)}%)</div>
                    </td>
                    <td className={`py-3 text-right font-mono ${trader.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      <div>{trader.unrealizedPnl >= 0 ? '+' : ''}${trader.unrealizedPnl.toFixed(2)}</div>
                      <div className="text-xs">({trader.unrealizedRoi >= 0 ? '+' : ''}{trader.unrealizedRoi.toFixed(2)}%)</div>
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
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase">Time</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase">Address</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Price</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Shares</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase text-right">Total</th>
                  <th className="pb-3 text-xs font-medium text-gray-400 uppercase">Tx Hash</th>
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
                    <td className="py-3">
                      <div className="text-sm text-gray-300">{trade.timestamp}</div>
                      <div className="text-xs text-gray-500">{trade.timeAgo}</div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/user/${trade.address}`)}
                        className="text-primary hover:text-primary/80 font-mono text-sm transition-colors"
                      >
                        {trade.address}
                      </button>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        trade.type === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {trade.type} {trade.outcome}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">${trade.price.toFixed(3)}</td>
                    <td className="py-3 text-right font-mono text-gray-300">{trade.shares.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-gray-100">${trade.total.toFixed(2)}</td>
                    <td className="py-3">
                      <a
                        href={`https://polygonscan.com/tx/${trade.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-mono text-xs transition-colors"
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
