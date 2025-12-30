import type { OrderBook } from '../types'

/**
 * 计算订单簿深度
 */
export function calculateDepth(
  orderBook: OrderBook,
  levels = 10
): { bidDepth: number; askDepth: number } {
  const bidDepth = orderBook.bids
    .slice(0, levels)
    .reduce((sum, level) => sum + parseFloat(level.size), 0)

  const askDepth = orderBook.asks
    .slice(0, levels)
    .reduce((sum, level) => sum + parseFloat(level.size), 0)

  return { bidDepth, askDepth }
}

/**
 * 计算深度偏度 (Depth Skew)
 * 正值表示买盘深度大，负值表示卖盘深度大
 */
export function calculateDepthSkew(bidDepth: number, askDepth: number): number {
  const totalDepth = bidDepth + askDepth
  if (totalDepth === 0) return 0
  return (bidDepth - askDepth) / totalDepth
}

/**
 * 计算价差 (Spread)
 */
export function calculateSpread(orderBook: OrderBook): number {
  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return 0
  }

  const bestBid = parseFloat(orderBook.bids[0].price)
  const bestAsk = parseFloat(orderBook.asks[0].price)

  return bestAsk - bestBid
}

/**
 * 计算价差百分比
 */
export function calculateSpreadPercent(orderBook: OrderBook): number {
  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return 0
  }

  const bestBid = parseFloat(orderBook.bids[0].price)
  const bestAsk = parseFloat(orderBook.asks[0].price)
  const midPrice = (bestBid + bestAsk) / 2

  if (midPrice === 0) return 0

  return ((bestAsk - bestBid) / midPrice) * 100
}

/**
 * 查找流动性墙（支撑位和阻力位）
 * 返回订单簿中大单聚集的价格水平
 */
export function findLiquidityWalls(orderBook: OrderBook, threshold = 50000): {
  support: number | null
  resistance: number | null
} {
  let support: number | null = null
  let resistance: number | null = null

  // 查找买盘中的大单（支撑位）
  for (const bid of orderBook.bids) {
    const size = parseFloat(bid.size)
    if (size >= threshold) {
      support = parseFloat(bid.price)
      break
    }
  }

  // 查找卖盘中的大单（阻力位）
  for (const ask of orderBook.asks) {
    const size = parseFloat(ask.size)
    if (size >= threshold) {
      resistance = parseFloat(ask.price)
      break
    }
  }

  return { support, resistance }
}

/**
 * 检测流动性缺口
 * 返回订单簿中价差过大的区间
 */
export function detectLiquidityGap(
  orderBook: OrderBook,
  gapThreshold = 0.05 // 5% 价差
): { from: number; to: number } | null {
  // 检查买卖盘之间的价差
  if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
    const bestBid = parseFloat(orderBook.bids[0].price)
    const bestAsk = parseFloat(orderBook.asks[0].price)
    const gap = bestAsk - bestBid

    if (gap > gapThreshold) {
      return { from: bestBid, to: bestAsk }
    }
  }

  // 检查买盘内部的价差
  for (let i = 0; i < orderBook.bids.length - 1; i++) {
    const price1 = parseFloat(orderBook.bids[i].price)
    const price2 = parseFloat(orderBook.bids[i + 1].price)
    const gap = price1 - price2

    if (gap > gapThreshold) {
      return { from: price2, to: price1 }
    }
  }

  // 检查卖盘内部的价差
  for (let i = 0; i < orderBook.asks.length - 1; i++) {
    const price1 = parseFloat(orderBook.asks[i].price)
    const price2 = parseFloat(orderBook.asks[i + 1].price)
    const gap = price2 - price1

    if (gap > gapThreshold) {
      return { from: price1, to: price2 }
    }
  }

  return null
}

/**
 * 计算价格变化百分比
 */
export function calculatePriceChange(
  oldPrice: number,
  newPrice: number
): number {
  if (oldPrice === 0) return 0
  return ((newPrice - oldPrice) / oldPrice) * 100
}

/**
 * 计算简单移动平均线 (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []

  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }

  return sma
}

/**
 * 计算波动率（标准差）
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length

  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
    prices.length

  return Math.sqrt(variance)
}

/**
 * 计算 ROI (Return on Investment)
 */
export function calculateROI(invested: number, returned: number): number {
  if (invested === 0) return 0
  return ((returned - invested) / invested) * 100
}
