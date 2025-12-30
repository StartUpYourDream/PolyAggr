/**
 * 应用常量
 */

// 市场分类
export const MARKET_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'finance', label: 'Finance' },
  { value: 'science', label: 'Science' },
] as const

// 排序选项
export const SORT_OPTIONS = [
  { value: 'volume', label: 'Volume' },
  { value: 'oi', label: 'Open Interest' },
  { value: 'change', label: 'Price Change' },
  { value: 'liquidity', label: 'Liquidity' },
  { value: 'end_date', label: 'Ending Soon' },
] as const

// 时间间隔选项
export const TIME_INTERVALS = [
  { value: '1s', label: '1s' },
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
  { value: '1w', label: '1w' },
] as const

// 时间周期选项
export const TIME_PERIODS = [
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'all', label: 'ALL' },
] as const

// Polymarket 链接
export const POLYMARKET_BASE_URL = 'https://polymarket.com'

export function getMarketUrl(slug: string) {
  return `${POLYMARKET_BASE_URL}/event/${slug}`
}

export function getUserUrl(address: string) {
  return `${POLYMARKET_BASE_URL}/profile/${address}`
}

// API 端点（代理后）
export const API_ENDPOINTS = {
  GAMMA: '/api/gamma',
  CLOB: '/api/clob',
} as const

// WebSocket URL
export const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws'

// 默认配置
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_ORDERBOOK_LEVELS = 10
export const DEFAULT_LIQUIDITY_THRESHOLD = 50000
export const DEFAULT_GAP_THRESHOLD = 0.05

// 颜色
export const COLORS = {
  primary: '#00d395',
  danger: '#ff4757',
  success: '#00d395',
  dark900: '#0a0b0d',
  dark800: '#12141a',
  dark700: '#1a1d24',
  dark600: '#22262f',
} as const
