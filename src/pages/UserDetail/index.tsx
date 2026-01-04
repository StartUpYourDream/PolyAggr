import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useUserProfile } from '../../hooks'
import { ProfitChart, RadarChart } from '../../components/charts'
import type { RadarDataPoint } from '../../components/charts'
import { formatDate, formatTimestamp } from '../../utils/format'
import { useTranslation } from '../../i18n'

type Tab = 'holdings' | 'trades' | 'activity'
type TimeRange = '1d' | '7d' | '30d' | 'all'

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
      endDate: formatDate(endDate),
      countdown: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
      firstTrade: formatDate(firstTradeDate),
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
      firstTrade: formatDate(firstTradeDate),
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

    const minutesAgo = Math.floor(Math.random() * 120)
    return {
      timestamp: formatTimestamp(date),
      timeAgo: minutesAgo,
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
  const { t } = useTranslation()
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('holdings')
  const [timeRange, setTimeRange] = useState<TimeRange>('1d')

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
          <div className="text-gray-400 mt-4">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="text-danger text-lg mb-2">{t('user.notFound')}</div>
          <div className="text-gray-400">{t('user.notFoundDesc')}</div>
        </div>
      </div>
    )
  }

  // Prepare radar chart data
  const categoryLabelMap: Record<string, string> = {
    crypto: t('user.crypto'),
    politics: t('user.politics'),
    sports: t('user.sports'),
    entertainment: t('user.entertainment'),
    finance: t('user.finance'),
  }

  const categoryData: RadarDataPoint[] = Object.entries(profile.categories).map(([label, value]) => ({
    label: categoryLabelMap[label] || label,
    value: value * 100, // Convert to percentage
  }))

  const behaviorData: RadarDataPoint[] = [
    { label: t('user.smartMoney'), value: profile.behavior.smartMoney * 100 },
    { label: t('user.trendFollower'), value: profile.behavior.trendFollower * 100 },
    { label: t('user.contrarian'), value: profile.behavior.contrarian * 100 },
    { label: t('user.noiseTrader'), value: profile.behavior.noiseTrader * 100 },
  ]

  const riskData: RadarDataPoint[] = [
    { label: t('user.highRisk'), value: 75 },
    { label: t('user.mediumRisk'), value: 60 },
    { label: t('user.lowRisk'), value: 40 },
    { label: t('user.conservative'), value: 50 },
  ]

  const beliefData: RadarDataPoint[] = [
    { label: t('user.longTerm'), value: 80 },
    { label: t('user.shortTerm'), value: 65 },
    { label: t('user.momentum'), value: 70 },
    { label: t('user.valueInvesting'), value: 55 },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'holdings', label: t('user.holdings') },
    { key: 'trades', label: t('user.tradeHistory') },
    { key: 'activity', label: t('user.activityLog') },
  ]

  // Get time range label
  const getTimeRangeLabel = () => {
    return t(`timeRange.${timeRange}`)
  }

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      {/* 顶部地址栏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-base">
            😊
          </div>
          <div className="font-mono text-gray-400 text-xs">
            {profile.address}
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { key: '1d' as TimeRange, label: t('timeRange.1d') },
            { key: '7d' as TimeRange, label: t('timeRange.1w') },
            { key: '30d' as TimeRange, label: t('timeRange.1m') },
            { key: 'all' as TimeRange, label: t('timeRange.all') },
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={`px-3 py-1.5 text-xs rounded transition-all cursor-pointer active:scale-95 ${
                timeRange === range.key
                  ? 'bg-primary !text-white font-semibold'
                  : 'bg-dark-700 dark:bg-dark-700 light:bg-gray-200 text-gray-400 dark:text-gray-400 light:text-gray-700 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-300 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 主要内容区 - 分为上下两部分 */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        {/* 上半部分：左边大卡片 + 右边两个小卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左列：盈亏图表卡片 (占 8/12) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 card p-5"
          >
            <div className="flex items-start gap-6 mb-4">
              {/* 左侧：余额和盈亏 */}
              <div className="flex-shrink-0">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('user.usdcBalance')}</div>
                  <div className="text-base font-mono text-gray-200 mb-3">$123,424.33</div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-400">{getTimeRangeLabel()}{t('user.pnl')}</span>
                  <button className="text-gray-500 hover:text-gray-300 cursor-pointer active:scale-95 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-500">59s</span>
                </div>
                <div>
                  <div className="text-4xl font-bold text-success">
                    +$299.8K <span className="text-2xl">+383%</span>
                  </div>
                </div>
              </div>

              {/* 右侧：AI 总结 */}
              <div className="flex-1 bg-dark-700/50 dark:bg-dark-700/50 light:bg-gray-100 rounded-lg p-4 border border-dark-600 dark:border-dark-600 light:border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-200">{t('user.aiSummary')}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('user.aiDescription')}
                </p>
              </div>
            </div>
            <div className="relative h-[280px]">
              <ProfitChart data={profile.pnl.history} height={280} />
            </div>
          </motion.div>

          {/* 右边上下两个卡片 (占 4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* 右上：交易统计卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-5 flex-1"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{getTimeRangeLabel()}{t('user.marketsParticipated')}</span>
                  <span className="text-gray-200 font-semibold">205</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{getTimeRangeLabel()}{t('user.totalTrades')}</span>
                  <span className="text-gray-200 font-semibold">
                    291 <span className="text-success">124</span> / <span className="text-danger">167</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{getTimeRangeLabel()}{t('user.totalVolumeStat')}</span>
                  <span className="text-gray-200 font-semibold">$200,005</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{getTimeRangeLabel()}{t('user.avgTradePrice')}</span>
                  <span className="text-gray-200 font-semibold">$205.64</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{getTimeRangeLabel()}{t('user.avgHoldingTime')}</span>
                  <span className="text-gray-200 font-semibold">$205.64</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('user.maxProfit')}</span>
                  <span className="text-gray-200 font-semibold">$205.64</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('user.maxLoss')}</span>
                  <span className="text-gray-200 font-semibold">$205.64</span>
                </div>
              </div>
            </motion.div>

            {/* 右下：盈亏占比卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5 flex-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">{t('user.pnlDistribution')}</span>
                <span className="text-xl font-bold text-gray-100">90%</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { range: '>500%', count: 1, percentage: 25, color: 'bg-success' },
                  { range: '200%~500%', count: 1, percentage: 25, color: 'bg-success' },
                  { range: '0%~200%', count: 0, percentage: 0, color: 'bg-gray-600' },
                  { range: '0%~-50%', count: 1, percentage: 25, color: 'bg-danger' },
                  { range: '<-50%', count: 1, percentage: 25, color: 'bg-danger' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">{item.range}</span>
                      <span className="text-gray-300">{item.count}({item.percentage}%)</span>
                    </div>
                    <div className="h-1 bg-dark-700 dark:bg-dark-700 light:bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 下半部分：4个雷达图 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <RadarChart data={categoryData} title={t('user.categoryAnalysis')} height={200} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <RadarChart data={behaviorData} title={t('user.behaviorAnalysis')} height={200} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-6"
          >
            <RadarChart data={riskData} title={t('user.riskPreference')} height={200} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <RadarChart data={beliefData} title={t('user.beliefAnalysis')} height={200} />
          </motion.div>
        </div>
      </div>


      {/* Bottom Tabs Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="border-b border-dark-600 dark:border-dark-600 light:border-gray-200">
          <div className="flex gap-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 text-sm font-medium transition-all relative cursor-pointer active:scale-95 ${
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
                  <tr className="text-left text-xs text-gray-500 border-b border-dark-600 dark:border-dark-600 light:border-gray-200">
                    <th className="pb-3 pr-4 font-medium">{t('table.eventName')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.shares')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.value')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.avgBuyPrice')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.avgSellPrice')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.realizedPnl')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.realizedRoi')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.unrealizedPnl')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.unrealizedRoi')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.endDate')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.countdown')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.firstTrade')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.status')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.buyCount')}</th>
                    <th className="pb-3 pl-2 font-medium text-right">{t('table.sellCount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHoldings.map((holding, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 hover:bg-dark-700/30 dark:hover:bg-dark-700/30 light:hover:bg-gray-100/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => navigate(`/event/${holding.marketSlug}`)}
                          className="text-sm text-primary hover:text-primary/80 transition-all text-left cursor-pointer active:scale-95"
                        >
                          {holding.market}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-100">
                        ${holding.value.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        ${holding.avgBuyPrice.toFixed(3)}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        ${holding.avgSellPrice.toFixed(3)}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        holding.realizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {holding.realizedPnl >= 0 ? '+' : ''}${holding.realizedPnl.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        holding.realizedRoi >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {holding.realizedRoi >= 0 ? '+' : ''}{holding.realizedRoi.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        holding.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {holding.unrealizedPnl >= 0 ? '+' : ''}${holding.unrealizedPnl.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        holding.unrealizedRoi >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {holding.unrealizedRoi >= 0 ? '+' : ''}{holding.unrealizedRoi.toFixed(2)}%
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-300">
                        {holding.endDate}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-500">
                        {holding.countdown}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-300">{holding.firstTrade}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          holding.status === 'Active'
                            ? 'bg-success/10 text-success'
                            : holding.status === 'Closed'
                            ? 'bg-gray-500/10 text-gray-400'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {holding.status === 'Active' ? t('table.active') : holding.status === 'Closed' ? t('table.closed') : t('table.settled')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-gray-300">
                        {holding.buyTxCount}
                      </td>
                      <td className="py-3 pl-2 text-sm text-right text-gray-300">
                        {holding.sellTxCount}
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
                  <tr className="text-left text-xs text-gray-500 border-b border-dark-600 dark:border-dark-600 light:border-gray-200">
                    <th className="pb-3 pr-4 font-medium">{t('table.eventName')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.avgBuyPrice')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.avgSellPrice')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.realizedPnl')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.realizedRoi')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.unrealizedPnl')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.unrealizedRoi')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.firstTrade')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.status')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.holdingDays')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.buyCount')}</th>
                    <th className="pb-3 pl-2 font-medium text-right">{t('table.sellCount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTradeHistory.map((trade, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 hover:bg-dark-700/30 dark:hover:bg-dark-700/30 light:hover:bg-gray-100/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => navigate(`/event/${trade.marketSlug}`)}
                          className="text-sm text-primary hover:text-primary/80 transition-all text-left cursor-pointer active:scale-95"
                        >
                          {trade.market}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        ${trade.avgBuyPrice.toFixed(3)}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        ${trade.avgSellPrice.toFixed(3)}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        trade.realizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {trade.realizedPnl >= 0 ? '+' : ''}${trade.realizedPnl.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        trade.realizedRoi >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {trade.realizedRoi >= 0 ? '+' : ''}{trade.realizedRoi.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        trade.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {trade.unrealizedPnl >= 0 ? '+' : ''}${trade.unrealizedPnl.toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        trade.unrealizedRoi >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {trade.unrealizedRoi >= 0 ? '+' : ''}{trade.unrealizedRoi.toFixed(2)}%
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-300">{trade.firstTrade}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          trade.status === 'Active'
                            ? 'bg-success/10 text-success'
                            : trade.status === 'Closed'
                            ? 'bg-gray-500/10 text-gray-400'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {trade.status === 'Active' ? t('table.active') : trade.status === 'Closed' ? t('table.closed') : t('table.settled')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        {trade.holdingDays} {t('table.days')}
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-gray-300">
                        {trade.buyTxCount}
                      </td>
                      <td className="py-3 pl-2 text-sm text-right text-gray-300">
                        {trade.sellTxCount}
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
                  <tr className="text-left text-xs text-gray-500 border-b border-dark-600 dark:border-dark-600 light:border-gray-200">
                    <th className="pb-3 pr-4 font-medium">{t('table.time')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.eventName')}</th>
                    <th className="pb-3 px-2 font-medium">{t('table.type')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.price')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.shares')}</th>
                    <th className="pb-3 px-2 font-medium text-right">{t('table.total')}</th>
                    <th className="pb-3 pl-2 font-medium text-right">{t('table.txHash')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockActivity.map((activity, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-dark-700 dark:border-dark-700 light:border-gray-100 hover:bg-dark-700/30 dark:hover:bg-dark-700/30 light:hover:bg-gray-100/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-4 text-sm">
                        <div className="text-gray-300">{activity.timestamp}</div>
                        <div className="text-xs text-gray-500">{activity.timeAgo} {t('user.minutesAgo')}</div>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => navigate(`/event/${activity.marketSlug}`)}
                          className="text-sm text-primary hover:text-primary/80 transition-all text-left cursor-pointer active:scale-95"
                        >
                          {activity.market}
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          activity.type === 'BUY'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}>
                          {activity.type === 'BUY' ? t('table.buy') : t('table.sell')} {activity.outcome === 'YES' ? t('table.yes') : t('table.no')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        ${activity.price.toFixed(3)}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-300">
                        {activity.shares.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-gray-100">
                        ${activity.total.toFixed(2)}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <a
                          href={`https://polygonscan.com/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-mono text-xs inline-block"
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
