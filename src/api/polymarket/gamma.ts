/**
 * Polymarket Gamma API
 * Base URL: https://gamma-api.polymarket.com
 * 用于获取市场数据、事件信息
 */

import axios from 'axios'
import type { Market } from '../../types'
import { mockGammaAPI } from '../mock'

const GAMMA_BASE_URL = '/api/gamma'
const USE_MOCK_DATA = true // 使用 Mock 数据（由于 API 访问限制）

const gammaClient = axios.create({
  baseURL: GAMMA_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 获取市场列表
 * @param params 查询参数
 */
export async function getMarkets(params?: {
  limit?: number
  offset?: number
  active?: boolean
  closed?: boolean
  archived?: boolean
  order?: 'volume' | 'liquidity' | 'end_date'
  ascending?: boolean
  tag?: string
}) {
  if (USE_MOCK_DATA) {
    return mockGammaAPI.getMarkets(params)
  }
  const response = await gammaClient.get<Market[]>('/markets', { params })
  return response.data
}

/**
 * 按 slug 获取单个市场详情
 * @param slug 市场 slug
 */
export async function getMarketBySlug(slug: string) {
  if (USE_MOCK_DATA) {
    return mockGammaAPI.getMarketBySlug(slug)
  }
  const response = await gammaClient.get<Market>(`/markets/${slug}`)
  return response.data
}

/**
 * 按 condition_id 获取市场详情
 * @param conditionId condition ID
 */
export async function getMarketByConditionId(conditionId: string) {
  const response = await gammaClient.get<Market>(`/markets/condition/${conditionId}`)
  return response.data
}

/**
 * 获取热门市场
 * @param limit 数量限制
 */
export async function getFeaturedMarkets(limit = 20) {
  if (USE_MOCK_DATA) {
    return mockGammaAPI.getFeaturedMarkets(limit)
  }
  const response = await gammaClient.get<Market[]>('/markets', {
    params: {
      limit,
      featured: true,
      active: true,
    },
  })
  return response.data
}

/**
 * 搜索市场
 * @param query 搜索关键词
 */
export async function searchMarkets(query: string, limit = 20) {
  if (USE_MOCK_DATA) {
    return mockGammaAPI.searchMarkets(query, limit)
  }
  const response = await gammaClient.get<Market[]>('/markets', {
    params: {
      limit,
      active: true,
    },
  })
  // 前端过滤（Gamma API 可能没有直接的搜索端点）
  return response.data.filter(market =>
    market.question.toLowerCase().includes(query.toLowerCase()) ||
    market.description.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * 按标签获取市场
 * @param tag 标签名
 */
export async function getMarketsByTag(tag: string, limit = 20) {
  const response = await gammaClient.get<Market[]>('/markets', {
    params: {
      limit,
      active: true,
      tag,
    },
  })
  return response.data
}

/**
 * 获取市场的采样价格数据（用于图表）
 * 注意：这个端点可能需要根据实际 API 调整
 */
export async function getMarketPrices(conditionId: string, interval?: string) {
  try {
    const response = await gammaClient.get(`/prices/${conditionId}`, {
      params: { interval },
    })
    return response.data
  } catch (error) {
    console.warn('Price history endpoint not available, using fallback')
    return []
  }
}
