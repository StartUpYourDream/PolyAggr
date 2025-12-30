import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useUserProfile } from '../../hooks'
import { UserStatsCard } from '../../components/user'
import { ProfitChart, RadarChart } from '../../components/charts'
import type { RadarDataPoint } from '../../components/charts'
import { formatCurrency, formatPercent } from '../../utils'

type Tab = 'holdings' | 'trades' | 'activity'

// Mock data generators
const generateMockHoldings = () => {
  const markets = [
    'BTC > $100K by EOY 2025?',
    'Will Trump win 2024?',
    'ETH > $5K in 2025?',
    'US Recession in 2025?',
    'Lakers win NBA 2025?',
    'Apple stock > $250?',
    'Bitcoin ETF approved?',
    'Fed cuts rates 3+ times?'
  ]
  const statuses = ['Active', 'Closed', 'Resolved']

  return Array.from({ length: 8 }, (_, i) => {
    const shares = Math.floor(Math.random() * 5000 + 100)
    const avgBuyPrice = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const avgSellPrice = avgBuyPrice > 0.5 ? +(avgBuyPrice + Math.random() * 0.1).toFixed(3) : +(avgBuyPrice - Math.random() * 0.1).toFixed(3)
    const value = +(shares * avgBuyPrice).toFixed(2)
    const realizedPnl = (Math.random() - 0.4) * 3000
    const unrealizedPnl = (Math.random() - 0.4) * 5000
    const totalInvested = value - unrealizedPnl
    const endDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
    const firstTradeDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    const holdingDays = Math.floor((Date.now() - firstTradeDate.getTime()) / (24 * 60 * 60 * 1000))

    return {
      market: markets[i],
      marketSlug: markets[i].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      shares,
      value,
      avgBuyPrice,
      avgSellPrice,
      realizedPnl,
      unrealizedPnl,
      realizedRoi: totalInvested > 0 ? (realizedPnl / totalInvested) * 100 : 0,
      unrealizedRoi: totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0,
      endDate: endDate.toLocaleDateString(),
      countdown: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
      firstTrade: firstTradeDate.toLocaleDateString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      buyTxCount: Math.floor(Math.random() * 20 + 1),
      sellTxCount: Math.floor(Math.random() * 15),
      holdingDays,
    }
  })
}

const generateMockTradeHistory = () => {
  const markets = [
    'BTC > $100K by EOY 2025?',
    'Will Trump win 2024?',
    'ETH > $5K in 2025?',
    'US Recession in 2025?',
    'Lakers win NBA 2025?',
    'Apple stock > $250?',
  ]
  const statuses = ['Active', 'Closed', 'Resolved']

  return Array.from({ length: 12 }, () => {
    const shares = Math.floor(Math.random() * 2000 + 50)
    const avgBuyPrice = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const avgSellPrice = avgBuyPrice > 0.5 ? +(avgBuyPrice + Math.random() * 0.1).toFixed(3) : +(avgBuyPrice - Math.random() * 0.1).toFixed(3)
    const value = +(shares * avgBuyPrice).toFixed(2)
    const realizedPnl = (Math.random() - 0.3) * 2000
    const unrealizedPnl = (Math.random() - 0.3) * 3000
    const totalInvested = value - unrealizedPnl
    const firstTradeDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    const holdingDays = Math.floor((Date.now() - firstTradeDate.getTime()) / (24 * 60 * 60 * 1000))

    return {
      market: markets[Math.floor(Math.random() * markets.length)],
      marketSlug: markets[0].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      avgBuyPrice,
      avgSellPrice,
      realizedPnl,
      unrealizedPnl,
      realizedRoi: totalInvested > 0 ? (realizedPnl / totalInvested) * 100 : 0,
      unrealizedRoi: totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0,
      firstTrade: firstTradeDate.toLocaleDateString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      holdingDays,
      buyTxCount: Math.floor(Math.random() * 15 + 1),
      sellTxCount: Math.floor(Math.random() * 10),
    }
  })
}

const generateMockActivity = () => {
  const markets = [
    'BTC > $100K by EOY 2025?',
    'Will Trump win 2024?',
    'ETH > $5K in 2025?',
    'US Recession in 2025?',
  ]
  const types = ['BUY', 'SELL']
  const outcomes = ['YES', 'NO']

  return Array.from({ length: 15 }, () => {
    const shares = Math.floor(Math.random() * 1000 + 10)
    const price = +(Math.random() * 0.6 + 0.2).toFixed(3)
    const now = Date.now()
    const timestamp = now - Math.floor(Math.random() * 7200000) // Within last 2 hours
    const date = new Date(timestamp)

    return {
      timestamp: date.toLocaleString(),
      timeAgo: `${Math.floor(Math.random() * 120)}m ago`,
      market: markets[Math.floor(Math.random() * markets.length)],
      marketSlug: markets[0].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: types[Math.floor(Math.random() * types.length)],
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      price,
      shares,
      total: +(shares * price).toFixed(2),
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    }
  })
}

export function UserDetail() {
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('holdings')

  // Get user profile data
  const { data: profile, isLoading } = useUserProfile(address)

  // Generate mock data (cached with useMemo to prevent regeneration on each render)
  const mockHoldings = useMemo(() => generateMockHoldings(), [])
  const mockTradeHistory = useMemo(() => generateMockTradeHistory(), [])
  const mockActivity = useMemo(() => generateMockActivity(), [])

  if (isLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-gray-400 mt-4">Loading user profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="text-danger text-lg mb-2">User not found</div>
          <div className="text-gray-400">The user profile you're looking for doesn't exist</div>
        </div>
      </div>
    )
  }

  // Prepare stats cards data - merge header info into Account
  const totalPnl = profile.pnl.realized + profile.pnl.unrealized
  const accountStats = [
    { label: 'Address', value: `${profile.address.slice(0, 8)}...${profile.address.slice(-6)}` },
    { label: 'Balance', value: formatCurrency(profile.balance), colorClass: 'text-gray-100' },
    {
      label: 'Total P&L',
      value: `${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl)}`,
      colorClass: totalPnl >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: 'ROI',
      value: formatPercent(profile.pnl.roi),
      colorClass: profile.pnl.roi >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: 'Win Rate',
      value: formatPercent(profile.stats.winRate),
      colorClass: 'text-primary'
    },
  ]

  const pnlStats = [
    {
      label: 'Realized P&L',
      value: `${profile.pnl.realized >= 0 ? '+' : ''}${formatCurrency(profile.pnl.realized)}`,
      colorClass: profile.pnl.realized >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: 'Unrealized P&L',
      value: `${profile.pnl.unrealized >= 0 ? '+' : ''}${formatCurrency(profile.pnl.unrealized)}`,
      colorClass: profile.pnl.unrealized >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: 'Total ROI',
      value: formatPercent(profile.pnl.roi),
      colorClass: profile.pnl.roi >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: '1D ROI',
      value: formatPercent(profile.pnl.roi1d),
      colorClass: profile.pnl.roi1d >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: '7D ROI',
      value: formatPercent(profile.pnl.roi7d),
      colorClass: profile.pnl.roi7d >= 0 ? 'text-success' : 'text-danger'
    },
    {
      label: '30D ROI',
      value: formatPercent(profile.pnl.roi30d),
      colorClass: profile.pnl.roi30d >= 0 ? 'text-success' : 'text-danger'
    },
  ]

  const tradingStats = [
    { label: 'Markets Traded', value: profile.stats.marketsCount },
    { label: 'Total Trades', value: profile.stats.totalTrades },
    { label: 'Total Volume', value: formatCurrency(profile.stats.totalVolume) },
    { label: 'Avg Trade Size', value: formatCurrency(profile.stats.avgTradeSize) },
    { label: 'Win Rate', value: formatPercent(profile.stats.winRate), colorClass: 'text-primary' },
    { label: 'Avg Holding Time', value: profile.stats.avgHoldingTime },
    {
      label: 'Best Trade',
      value: `+${formatCurrency(profile.stats.bestTrade)}`,
      colorClass: 'text-success'
    },
    {
      label: 'Worst Trade',
      value: `-${formatCurrency(Math.abs(profile.stats.worstTrade))}`,
      colorClass: 'text-danger'
    },
  ]

  // Prepare radar chart data
  const categoryData: RadarDataPoint[] = Object.entries(profile.categories).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: value * 100, // Convert to percentage
  }))

  const behaviorData: RadarDataPoint[] = [
    { label: 'Smart Money', value: profile.behavior.smartMoney * 100 },
    { label: 'Trend Follower', value: profile.behavior.trendFollower * 100 },
    { label: 'Contrarian', value: profile.behavior.contrarian * 100 },
    { label: 'Noise Trader', value: profile.behavior.noiseTrader * 100 },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'holdings', label: 'Holdings' },
    { key: 'trades', label: 'Trade History' },
    { key: 'activity', label: 'Activity' },
  ]

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      {/* Compact Top Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          {/* Left: Avatar & Address */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {profile.address.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Address</div>
              <div className="text-lg font-mono font-semibold text-gray-100">
                {profile.address.slice(0, 8)}...{profile.address.slice(-6)}
              </div>
            </div>
          </div>

          {/* Center: Key Metrics */}
          <div className="flex items-center gap-8">
            {/* Win Rate */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Win Rate</div>
              <div className="text-3xl font-bold text-primary">
                {formatPercent(profile.stats.winRate)}
              </div>
            </div>

            {/* 7D Realized PnL */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">7D Realized PnL</div>
              <div className={`text-3xl font-bold ${profile.pnl.realized >= 0 ? 'text-success' : 'text-danger'}`}>
                {profile.pnl.realized >= 0 ? '+' : ''}${profile.pnl.realized.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {profile.pnl.roi >= 0 ? '+' : ''}{profile.pnl.roi.toFixed(2)}%
              </div>
            </div>

            {/* Total PnL */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Total PnL</div>
              <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Right: Balance */}
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Balance</div>
            <div className="text-2xl font-bold text-gray-100">
              {formatCurrency(profile.balance)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analysis & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Markets Traded</div>
              <div className="text-xl font-bold text-gray-100">{profile.stats.marketsCount}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total Trades</div>
              <div className="text-xl font-bold text-gray-100">{profile.stats.totalTrades}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">7D Vol</div>
              <div className="text-xl font-bold text-gray-100">{formatCurrency(profile.stats.totalVolume)}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Avg Trade Size</div>
              <div className="text-xl font-bold text-gray-100">{formatCurrency(profile.stats.avgTradeSize)}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Avg Holding Time</div>
              <div className="text-lg font-bold text-gray-100">{profile.stats.avgHoldingTime}</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Best Trade</div>
              <div className="text-lg font-bold text-success">+{formatCurrency(profile.stats.bestTrade)}</div>
            </div>
          </div>
        </motion.div>

        {/* Distribution Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Distribution (Token 365)</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">&gt;500%</span>
                <span className="text-gray-300">0</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">200% - 500%</span>
                <span className="text-gray-300">0</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-success/80" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">0% - 200%</span>
                <span className="text-gray-300">{Math.floor(profile.stats.marketsCount * 0.7)}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-success/60" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">-50% - 0%</span>
                <span className="text-gray-300">{Math.floor(profile.stats.marketsCount * 0.2)}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-danger/60" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">&lt;-50%</span>
                <span className="text-gray-300">{Math.floor(profile.stats.marketsCount * 0.1)}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-danger" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Profit Curve */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-6 card p-6"
        >
          <ProfitChart data={profile.pnl.history} height={300} />
        </motion.div>

        {/* Category Distribution Radar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 card p-6"
        >
          <RadarChart data={categoryData} title="Category Distribution" height={300} color="#00d395" />
        </motion.div>

        {/* Behavior Analysis Radar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-3 card p-6"
        >
          <RadarChart data={behaviorData} title="Behavior Analysis" height={300} color="#3b82f6" />
        </motion.div>
      </div>

      {/* Bottom Tabs Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
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
                    layoutId="userActiveTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-dark-600">
                    <th className="pb-3 font-medium">Event Name</th>
                    <th className="pb-3 font-medium text-right">Shares</th>
                    <th className="pb-3 font-medium text-right">Value</th>
                    <th className="pb-3 font-medium text-right">Avg Buy</th>
                    <th className="pb-3 font-medium text-right">Avg Sell</th>
                    <th className="pb-3 font-medium text-right">Realized P&L</th>
                    <th className="pb-3 font-medium text-right">Unrealized P&L</th>
                    <th className="pb-3 font-medium">End Date</th>
                    <th className="pb-3 font-medium">First Trade</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Tx Count</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHoldings.map((holding, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="py-3">
                        <button
                          onClick={() => navigate(`/event/${holding.marketSlug}`)}
                          className="text-sm text-primary hover:text-primary/80 transition-colors text-left"
                        >
                          {holding.market}
                        </button>
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-100">
                        ${holding.value.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        ${holding.avgBuyPrice.toFixed(3)}
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        ${holding.avgSellPrice.toFixed(3)}
                      </td>
                      <td className={`py-3 text-sm text-right font-mono ${
                        holding.realizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        <div>{holding.realizedPnl >= 0 ? '+' : ''}${holding.realizedPnl.toFixed(2)}</div>
                        <div className="text-xs">({holding.realizedRoi >= 0 ? '+' : ''}{holding.realizedRoi.toFixed(2)}%)</div>
                      </td>
                      <td className={`py-3 text-sm text-right font-mono ${
                        holding.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        <div>{holding.unrealizedPnl >= 0 ? '+' : ''}${holding.unrealizedPnl.toFixed(2)}</div>
                        <div className="text-xs">({holding.unrealizedRoi >= 0 ? '+' : ''}{holding.unrealizedRoi.toFixed(2)}%)</div>
                      </td>
                      <td className="py-3 text-sm text-gray-300">
                        <div>{holding.endDate}</div>
                        <div className="text-xs text-gray-500">{holding.countdown}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-300">{holding.firstTrade}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          holding.status === 'Active'
                            ? 'bg-success/10 text-success'
                            : holding.status === 'Closed'
                            ? 'bg-gray-500/10 text-gray-400'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {holding.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-right text-gray-300">
                        <div className="text-xs">Buy: {holding.buyTxCount}</div>
                        <div className="text-xs">Sell: {holding.sellTxCount}</div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Trade History Tab - Top Trades */}
          {activeTab === 'trades' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-dark-600">
                    <th className="pb-3 font-medium">Event Name</th>
                    <th className="pb-3 font-medium text-right">Avg Buy</th>
                    <th className="pb-3 font-medium text-right">Avg Sell</th>
                    <th className="pb-3 font-medium text-right">Realized P&L</th>
                    <th className="pb-3 font-medium text-right">Unrealized P&L</th>
                    <th className="pb-3 font-medium">First Trade</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Holding Days</th>
                    <th className="pb-3 font-medium text-right">Tx Count</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTradeHistory.map((trade, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="py-3">
                        <button
                          onClick={() => navigate(`/event/${trade.marketSlug}`)}
                          className="text-sm text-primary hover:text-primary/80 transition-colors text-left"
                        >
                          {trade.market}
                        </button>
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        ${trade.avgBuyPrice.toFixed(3)}
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        ${trade.avgSellPrice.toFixed(3)}
                      </td>
                      <td className={`py-3 text-sm text-right font-mono ${
                        trade.realizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        <div>{trade.realizedPnl >= 0 ? '+' : ''}${trade.realizedPnl.toFixed(2)}</div>
                        <div className="text-xs">({trade.realizedRoi >= 0 ? '+' : ''}{trade.realizedRoi.toFixed(2)}%)</div>
                      </td>
                      <td className={`py-3 text-sm text-right font-mono ${
                        trade.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        <div>{trade.unrealizedPnl >= 0 ? '+' : ''}${trade.unrealizedPnl.toFixed(2)}</div>
                        <div className="text-xs">({trade.unrealizedRoi >= 0 ? '+' : ''}{trade.unrealizedRoi.toFixed(2)}%)</div>
                      </td>
                      <td className="py-3 text-sm text-gray-300">{trade.firstTrade}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          trade.status === 'Active'
                            ? 'bg-success/10 text-success'
                            : trade.status === 'Closed'
                            ? 'bg-gray-500/10 text-gray-400'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        {trade.holdingDays}d
                      </td>
                      <td className="py-3 text-sm text-right text-gray-300">
                        <div className="text-xs">Buy: {trade.buyTxCount}</div>
                        <div className="text-xs">Sell: {trade.sellTxCount}</div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-dark-600">
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Event Name</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium text-right">Shares</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {mockActivity.map((activity, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="py-3 text-sm">
                        <div className="text-gray-300">{activity.timestamp}</div>
                        <div className="text-xs text-gray-500">{activity.timeAgo}</div>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => navigate(`/event/${activity.marketSlug}`)}
                          className="text-sm text-primary hover:text-primary/80 transition-colors text-left"
                        >
                          {activity.market}
                        </button>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          activity.type === 'BUY'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}>
                          {activity.type} {activity.outcome}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        ${activity.price.toFixed(3)}
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-300">
                        {activity.shares.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-right font-mono text-gray-100">
                        ${activity.total.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://polygonscan.com/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-mono text-xs"
                        >
                          {activity.txHash.slice(0, 10)}...{activity.txHash.slice(-8)}
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
