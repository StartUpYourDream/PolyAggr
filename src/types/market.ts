// Polymarket API 响应类型定义

export interface Market {
  id: string
  question: string
  description: string
  image: string
  icon: string
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  submitted_by: string
  resolved: boolean
  volume: string
  volume24hr: string
  liquidity: string
  end_date_iso: string
  game_start_time: string | null
  seconds_delay: number
  fpmm: string
  maker_base_fee: number
  taker_base_fee: number
  spread_fee: number
  neg_risk: boolean
  neg_risk_market_id: string | null
  neg_risk_request_id: string | null
  accepting_orders: boolean
  accepting_order_timestamp: string | null
  minimum_tick_size: number
  minimum_order_size: number
  outcomes: Outcome[]
  tokens: Token[]
  markets: SubMarket[]
  enable_order_book: boolean
  order_price_minimum: number
  order_price_maximum: number
  market_slug: string
  minimum_order_size_usd: number
  tags: string[]
  condition_id: string
  question_id: string
  notification_threshold: number
  rewards: any
  cyom: boolean
  comment_count: number
  clob_token_ids: string[]
}

export interface Outcome {
  id: string
  price: string
  size: string
  price_change_percent: number
}

export interface Token {
  token_id: string
  outcome: string
  price: string
  winner: boolean
}

export interface SubMarket {
  id: string
  question: string
  outcomes: Outcome[]
  outcomePrices: string[]
  volume: string
  active: boolean
  closed: boolean
  archived: boolean
  accepting_orders: boolean
  min_tick_size: number
  min_order_size: number
  end_date_iso: string
  game_start_time: string | null
  question_id: string
  neg_risk: boolean
  grouped_positions: string[]
  seconds_delay: number
  notification_threshold: number
  active_order_count: number
  icon: string
  description: string
  image: string
  enable_order_book: boolean
  best_bid: string | null
  best_ask: string | null
}

// CLOB API 订单簿类型
export interface OrderBook {
  market: string
  asset_id: string
  timestamp: number
  hash: string
  bids: OrderLevel[]
  asks: OrderLevel[]
}

export interface OrderLevel {
  price: string
  size: string
}

// 价格历史
export interface PriceHistory {
  t: number // timestamp
  p: number // price
}

// 交易历史
export interface Trade {
  id: string
  taker_order_id: string
  market: string
  asset_id: string
  side: 'BUY' | 'SELL'
  size: string
  fee_rate_bps: string
  price: string
  status: string
  match_time: string
  last_update: string
  outcome: string
  bucket_index: number
  owner: string
  count: number
  transaction_hash: string
  maker_address: string
  maker_orders?: any[]
}

// 用户持仓
export interface Position {
  asset_id: string
  market: string
  market_slug: string
  user_address: string
  outcome: string
  size: string
  value: string
}

// 市场统计数据 (自定义计算)
export interface MarketStats {
  volume24h: number
  openInterest: number
  oiChange24h: number
  bidDepth: number
  askDepth: number
  depthSkew: number
  spread: number
  liquidityWalls: {
    support: number
    resistance: number
  }
  liquidityGap: {
    from: number
    to: number
  } | null
  priceChange1h: number
  priceChange6h: number
  priceChange24h: number
  priceSlope: number
  volatility: number
}
