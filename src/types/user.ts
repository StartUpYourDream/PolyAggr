// 用户相关类型定义

export interface UserProfile {
  address: string
  balance: number
  stats: UserStats
  pnl: UserPnL
  categories: CategoryDistribution
  behavior: BehaviorAnalysis
}

export interface UserStats {
  marketsCount: number
  totalTrades: number
  totalVolume: number
  avgTradeSize: number
  bestTrade: number
  worstTrade: number
  avgHoldingTime: string
  winRate: number
}

export interface UserPnL {
  realized: number
  unrealized: number
  roi: number
  roi1d: number
  roi7d: number
  roi30d: number
  history: Array<{
    timestamp: number
    profit: number
  }>
}

export interface CategoryDistribution {
  crypto: number
  politics: number
  sports: number
  entertainment: number
  finance: number
  [key: string]: number
}

export interface BehaviorAnalysis {
  smartMoney: number
  trendFollower: number
  contrarian: number
  noiseTrader: number
}

export interface UserHolding {
  marketId: string
  marketName: string
  assetId: string
  outcome: string
  size: number
  value: number
  avgBuyPrice: number
  avgSellPrice: number
  realizedPnL: number
  unrealizedPnL: number
  endDate: string
  firstTradeTime: string
  status: 'active' | 'closed' | 'resolved'
  buyTxCount: number
  sellTxCount: number
}

export interface UserTrade {
  marketId: string
  marketName: string
  outcome: string
  side: 'BUY' | 'SELL'
  size: number
  price: number
  value: number
  realizedPnL?: number
  unrealizedPnL?: number
  timestamp: string
  txHash: string
}

export interface TopTrade {
  marketId: string
  marketName: string
  avgBuyPrice: number
  avgSellPrice: number
  realizedPnL: number
  unrealizedPnL: number
  firstTradeTime: string
  status: string
  holdingTime: string
  buyTxCount: number
  sellTxCount: number
}
