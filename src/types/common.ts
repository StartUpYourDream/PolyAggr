// 通用类型定义

export type TimeInterval = '1s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

export type MarketCategory = 'crypto' | 'politics' | 'sports' | 'entertainment' | 'finance' | 'all'

export type SortBy = 'volume' | 'oi' | 'change' | 'liquidity' | 'end_date'

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  offset: number
  limit: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
  timestamp?: number
}

export interface ChartDataPoint {
  time: number
  value: number
}

export interface SearchResult {
  type: 'market' | 'user'
  id: string
  name: string
  description?: string
  avatar?: string
}
