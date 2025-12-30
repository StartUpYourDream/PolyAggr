/**
 * Polymarket CLOB (Central Limit Order Book) API
 * Base URL: https://clob.polymarket.com
 * 用于获取订单簿、交易历史、价格数据
 */

import axios from 'axios'
import type { OrderBook, PriceHistory, Trade, Position, UserProfile } from '../../types'
import { mockCLOBAPI } from '../mock'

const CLOB_BASE_URL = '/api/clob'
const USE_MOCK_DATA = true

const clobClient = axios.create({
  baseURL: CLOB_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 获取订单簿
 * @param tokenId Token ID
 */
export async function getOrderBook(tokenId: string) {
  if (USE_MOCK_DATA) {
    return mockCLOBAPI.getOrderBook(tokenId)
  }
  const response = await clobClient.get<OrderBook>('/book', {
    params: { token_id: tokenId },
  })
  return response.data
}

/**
 * 获取多个 token 的订单簿
 * @param tokenIds Token IDs 数组
 */
export async function getOrderBooks(tokenIds: string[]) {
  const promises = tokenIds.map(id => getOrderBook(id))
  return Promise.all(promises)
}

/**
 * 获取价格历史数据
 * @param tokenId Token ID
 * @param interval 时间间隔
 * @param fidelity 数据精度
 */
export async function getPriceHistory(
  tokenId: string,
  params?: {
    interval?: string // 'max', '1d', '1w', etc
    fidelity?: number // 数据点数量
  }
) {
  if (USE_MOCK_DATA) {
    return mockCLOBAPI.getPriceHistory(tokenId, params)
  }
  const response = await clobClient.get<PriceHistory[]>('/prices-history', {
    params: {
      market: tokenId,
      interval: params?.interval || 'max',
      fidelity: params?.fidelity || 1000,
    },
  })
  return response.data
}

/**
 * 获取交易历史
 * @param tokenId Token ID
 * @param params 查询参数
 */
export async function getTrades(
  tokenId: string,
  params?: {
    limit?: number
    offset?: number
    before?: number // timestamp
    after?: number // timestamp
  }
) {
  const response = await clobClient.get<Trade[]>('/trades', {
    params: {
      asset_id: tokenId,
      ...params,
    },
  })
  return response.data
}

/**
 * 获取市场的所有交易
 * @param marketId Market ID
 */
export async function getMarketTrades(marketId: string, limit = 100) {
  const response = await clobClient.get<Trade[]>('/trades', {
    params: {
      market: marketId,
      limit,
    },
  })
  return response.data
}

/**
 * 获取用户持仓
 * @param address 用户地址
 */
export async function getUserPositions(address: string) {
  const response = await clobClient.get<Position[]>(`/positions/${address}`)
  return response.data
}

/**
 * 获取用户在特定市场的交易
 * @param address 用户地址
 * @param marketId 市场 ID
 */
export async function getUserMarketTrades(
  address: string,
  marketId: string,
  limit = 100
) {
  const response = await clobClient.get<Trade[]>('/trades', {
    params: {
      market: marketId,
      maker_address: address,
      limit,
    },
  })
  return response.data
}

/**
 * 获取用户所有交易历史
 * @param address 用户地址
 */
export async function getUserTrades(address: string, limit = 100) {
  const response = await clobClient.get<Trade[]>('/trades', {
    params: {
      maker_address: address,
      limit,
    },
  })
  return response.data
}

/**
 * 获取市场的 24h 交易量
 * @param marketId Market ID
 */
export async function getMarketVolume24h(marketId: string) {
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000

  const trades = await getMarketTrades(marketId, 1000)

  const volume24h = trades
    .filter(trade => new Date(trade.match_time).getTime() > oneDayAgo)
    .reduce((sum, trade) => sum + parseFloat(trade.size) * parseFloat(trade.price), 0)

  return volume24h
}

/**
 * 计算订单簿深度
 * @param orderBook 订单簿数据
 * @param levels 深度档位数
 */
export function calculateDepth(orderBook: OrderBook, levels = 10) {
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
 * @param bidDepth 买盘深度
 * @param askDepth 卖盘深度
 */
export function calculateDepthSkew(bidDepth: number, askDepth: number) {
  const totalDepth = bidDepth + askDepth
  if (totalDepth === 0) return 0
  return (bidDepth - askDepth) / totalDepth
}

/**
 * 计算价差 (Spread)
 * @param orderBook 订单簿
 */
export function calculateSpread(orderBook: OrderBook) {
  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return 0
  }

  const bestBid = parseFloat(orderBook.bids[0].price)
  const bestAsk = parseFloat(orderBook.asks[0].price)

  return bestAsk - bestBid
}

/**
 * 获取用户完整 Profile（统计、PnL、分类、行为分析）
 * @param address 用户地址
 */
export async function getUserProfile(address: string): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    return mockCLOBAPI.getUserProfile(address)
  }
  // Real API implementation would combine multiple endpoints
  const response = await clobClient.get<UserProfile>(`/users/${address}/profile`)
  return response.data
}
