import { useQuery } from '@tanstack/react-query'
import { getPriceHistory } from '../api'
import type { TimeInterval } from '../types'

/**
 * 获取价格历史数据
 */
export function usePriceHistory(
  tokenId: string | undefined,
  interval: TimeInterval = '1d',
  fidelity = 1000
) {
  return useQuery({
    queryKey: ['price-history', tokenId, interval, fidelity],
    queryFn: () =>
      tokenId
        ? getPriceHistory(tokenId, { interval, fidelity })
        : Promise.resolve([]),
    enabled: !!tokenId,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * 计算价格变化百分比
 */
export function calculatePriceChange(
  prices: Array<{ t: number; p: number }>,
  hoursAgo: number
) {
  if (prices.length === 0) return 0

  const now = Date.now()
  const targetTime = now - hoursAgo * 60 * 60 * 1000

  // 找到最接近目标时间的价格
  const closestIndex = prices.findIndex((p) => p.t * 1000 >= targetTime)

  if (closestIndex === -1 || closestIndex === prices.length - 1) {
    return 0
  }

  const oldPrice = prices[closestIndex].p
  const currentPrice = prices[prices.length - 1].p

  if (oldPrice === 0) return 0

  return ((currentPrice - oldPrice) / oldPrice) * 100
}

/**
 * 计算价格斜率（趋势）
 */
export function calculatePriceSlope(prices: Array<{ t: number; p: number }>) {
  if (prices.length < 2) return 0

  // 简单线性回归
  const n = prices.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  prices.forEach((point, index) => {
    const x = index
    const y = point.p

    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  })

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  return slope
}
