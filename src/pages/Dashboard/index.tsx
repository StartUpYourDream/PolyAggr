import { useState } from 'react'
import { useTranslation } from '../../i18n'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Platform, getDashboardData } from '../../api/mock/dashboard'
import { formatCurrency, formatNumber } from '../../utils/format'

export function Dashboard() {
  const { t } = useTranslation()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.ALL)

  const data = getDashboardData(selectedPlatform)

  // 平台选项卡
  const platforms = [
    { key: Platform.ALL, label: t('dashboard.platform.all') },
    { key: Platform.POLYMARKET, label: t('dashboard.platform.polymarket') },
    { key: Platform.KALSHI, label: t('dashboard.platform.kalshi') },
    { key: Platform.MANIFOLD, label: t('dashboard.platform.manifold') },
  ]

  // KPI 卡片
  const kpiCards = [
    { label: t('dashboard.kpi.totalVolume'), value: formatCurrency(data.kpi.totalVolume), color: 'text-primary' },
    { label: t('dashboard.kpi.volume24h'), value: formatCurrency(data.kpi.volume24h), color: 'text-green-400' },
    { label: t('dashboard.kpi.totalUsers'), value: formatNumber(data.kpi.totalUsers), color: 'text-blue-400' },
    { label: t('dashboard.kpi.activeUsers'), value: formatNumber(data.kpi.activeUsers), color: 'text-purple-400' },
    { label: t('dashboard.kpi.totalMarkets'), value: formatNumber(data.kpi.totalMarkets), color: 'text-orange-400' },
    { label: t('dashboard.kpi.activeMarkets'), value: formatNumber(data.kpi.activeMarkets), color: 'text-pink-400' },
  ]

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* 平台选择器 - 使用 Tabs */}
      <div className="flex items-center gap-2 bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-2">
        {platforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => setSelectedPlatform(platform.key)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              selectedPlatform === platform.key
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900 hover:bg-dark-700/50 dark:hover:bg-dark-700/50 light:hover:bg-gray-100'
            }`}
          >
            {platform.label}
          </button>
        ))}
      </div>

      {/* KPI 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6"
          >
            <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
              {card.label}
            </div>
            <div className={`text-2xl font-bold font-mono ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* 图表网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 交易量趋势 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.volumeTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.volumeTrend}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#34d399"
                strokeWidth={3}
                fill="url(#colorVolume)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 用户增长 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.userGrowth')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userGrowth}>
              <XAxis
                dataKey="date"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatNumber(value as number)}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ fill: '#60a5fa', r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 事件状态分布 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.eventStatus')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.eventStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.eventStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatNumber(value as number)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 分类分布 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.categoryDistribution')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatNumber(value as number)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 热门市场 */}
        <div className="lg:col-span-2 bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.topMarkets')}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.topMarkets} layout="vertical">
              <XAxis
                type="number"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                width={200}
                tickFormatter={(value) => value.length > 30 ? value.slice(0, 30) + '...' : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar
                dataKey="volume"
                fill="#a78bfa"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 第二行图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 平均回报率趋势 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.avgReturnTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.avgReturnTrend}>
              <defs>
                <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => `${(value as number).toFixed(2)}%`}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="return"
                stroke="#6ee7b7"
                strokeWidth={3}
                fill="url(#colorReturn)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 新增市场趋势 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.newMarketsTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.newMarketsTrend}>
              <XAxis
                dataKey="date"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatNumber(value as number)}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
              />
              <Bar
                dataKey="markets"
                fill="#fb923c"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 流动性分布 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.liquidityDistribution')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.liquidityDistribution}>
              <XAxis
                dataKey="range"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatNumber(value as number)}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
              >
                {data.liquidityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 分类交易量 */}
        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900 mb-4">
            {t('dashboard.charts.volumeByCategory')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.volumeByCategory} layout="vertical">
              <XAxis
                type="number"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <YAxis
                type="category"
                dataKey="category"
                stroke="none"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar
                dataKey="volume"
                fill="#c084fc"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </div>
  )
}
