import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n'
import { mockLeaderboardData, type LeaderboardUser } from '../../api/mock/leaderboard'
import { formatCurrency, formatPercent, formatPnL } from '../../utils/format'

type SortField = keyof LeaderboardUser
type SortDirection = 'asc' | 'desc'

export function Leaderboard() {
  const { t } = useTranslation()
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // 处理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 如果点击同一列，切换排序方向
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // 如果点击不同列，设置为该列并默认降序（除了 rank）
      setSortField(field)
      setSortDirection(field === 'rank' ? 'asc' : 'desc')
    }
  }

  // 排序后的数据
  const sortedData = useMemo(() => {
    const sorted = [...mockLeaderboardData].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      // 字符串比较
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })

    return sorted
  }, [sortField, sortDirection])

  // 渲染排序图标
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  // 渲染排名徽章
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return <span className="text-xl">🥇</span>
    }
    if (rank === 2) {
      return <span className="text-xl">🥈</span>
    }
    if (rank === 3) {
      return <span className="text-xl">🥉</span>
    }
    return <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">{rank}</span>
  }

  // 可排序的表头组件
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900 transition-colors group"
    >
      <div className="flex items-center gap-2">
        {children}
        {renderSortIcon(field)}
      </div>
    </th>
  )

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">
            {t('leaderboard.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
            {t('leaderboard.subtitle')}
          </p>
        </div>
      </div>

      {/* 排行榜表格 */}
      <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-dark-700 dark:border-dark-700 light:border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700 dark:divide-dark-700 light:divide-gray-200">
            <thead className="bg-dark-900 dark:bg-dark-900 light:bg-gray-50">
              <tr>
                <SortableHeader field="rank">{t('leaderboard.rank')}</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                  {t('leaderboard.address')}
                </th>
                <SortableHeader field="balance">{t('leaderboard.balance')}</SortableHeader>
                <SortableHeader field="portfolioValue">{t('leaderboard.portfolioValue')}</SortableHeader>
                <SortableHeader field="pnl7d">{t('leaderboard.pnl7d')}</SortableHeader>
                <SortableHeader field="pnl30d">{t('leaderboard.pnl30d')}</SortableHeader>
                <SortableHeader field="pnlTotal">{t('leaderboard.pnlTotal')}</SortableHeader>
                <SortableHeader field="winRate">{t('leaderboard.winRate')}</SortableHeader>
                <SortableHeader field="buyCount">{t('leaderboard.buyCount')}</SortableHeader>
                <SortableHeader field="sellCount">{t('leaderboard.sellCount')}</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-dark-800 dark:bg-dark-800 light:bg-white divide-y divide-dark-700 dark:divide-dark-700 light:divide-gray-100">
              {sortedData.map((user) => (
                <tr
                  key={user.address}
                  className="hover:bg-dark-700 dark:hover:bg-dark-700 light:hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {renderRankBadge(user.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/user/${user.address}`}
                      className="text-primary hover:text-primary-light transition-colors font-mono"
                    >
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </Link>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {formatCurrency(user.balance)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {formatCurrency(user.portfolioValue)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">
                    <div className="flex flex-col">
                      <span className={user.pnl7d >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPnL(user.pnl7d)}
                      </span>
                      <span className={`text-xs ${user.roi7d >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                        {formatPercent(user.roi7d)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">
                    <div className="flex flex-col">
                      <span className={user.pnl30d >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPnL(user.pnl30d)}
                      </span>
                      <span className={`text-xs ${user.roi30d >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                        {formatPercent(user.roi30d)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">
                    <div className="flex flex-col">
                      <span className={user.pnlTotal >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPnL(user.pnlTotal)}
                      </span>
                      <span className={`text-xs ${user.roiTotal >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                        {formatPercent(user.roiTotal)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {user.winRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {user.buyCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {user.sellCount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}
