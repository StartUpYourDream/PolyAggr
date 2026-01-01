/**
 * Mock 数据服务 - 模拟 Polymarket API 响应
 * 用于开发和测试，提供真实感的数据
 */

import type { Market, OrderBook, PriceHistory, UserProfile } from '../../types'

// 生成子市场数据
function generateSubMarkets(parentId: number, count: number) {
  const subMarkets = []
  const subQuestions = [
    'Q1 2025',
    'Q2 2025',
    'Q3 2025',
    'Q4 2025',
    'Before June 2025',
    'Before December 2025',
    'Early 2025',
    'Late 2025',
  ]

  for (let i = 0; i < count; i++) {
    const yesPrice = 0.2 + Math.random() * 0.6
    const noPrice = 1 - yesPrice
    const volume = Math.random() * 500000 + 50000

    subMarkets.push({
      id: `submarket-${parentId}-${i}`,
      question: subQuestions[i % subQuestions.length],
      outcomes: [
        {
          id: `suboutcome-yes-${parentId}-${i}`,
          price: yesPrice.toString(),
          size: (Math.random() * 50000).toString(),
          price_change_percent: (Math.random() * 20 - 10),
        },
        {
          id: `suboutcome-no-${parentId}-${i}`,
          price: noPrice.toString(),
          size: (Math.random() * 50000).toString(),
          price_change_percent: (Math.random() * 20 - 10),
        },
      ],
      outcomePrices: [yesPrice.toString(), noPrice.toString()],
      volume: volume.toString(),
      active: true,
      closed: false,
      archived: false,
      accepting_orders: true,
      min_tick_size: 0.01,
      min_order_size: 1,
      end_date_iso: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      game_start_time: null,
      question_id: `subquestion-${parentId}-${i}`,
      neg_risk: false,
      grouped_positions: [],
      seconds_delay: 0,
      notification_threshold: 0.1,
      active_order_count: Math.floor(Math.random() * 100),
      icon: `https://picsum.photos/seed/${parentId}-${i}/50/50`,
      description: `Sub-market for ${subQuestions[i % subQuestions.length]}`,
      image: `https://picsum.photos/seed/${parentId}-${i}/200/200`,
      enable_order_book: true,
      best_bid: (yesPrice - 0.01).toFixed(4),
      best_ask: (yesPrice + 0.01).toFixed(4),
    })
  }

  return subMarkets
}

// 生成随机市场数据
function generateMockMarket(id: number, category: string): Market {
  const questions = {
    crypto: [
      'Will Bitcoin reach $150k by end of 2025?',
      'Will Ethereum flip Bitcoin market cap in 2025?',
      'Will Solana reach $500 in 2025?',
      'Will a Bitcoin ETF be approved in 2025?',
      'Will crypto market cap exceed $5T in 2025?',
    ],
    politics: [
      'Will Trump win 2028 election?',
      'Will there be a government shutdown in 2025?',
      'Will the debt ceiling be raised in 2025?',
      'Will Republicans control the Senate in 2026?',
      'Will Biden run for reelection?',
    ],
    sports: [
      'Will Lakers win NBA Championship 2025?',
      'Will Messi win Ballon d\'Or 2025?',
      'Will Tom Brady retire in 2025?',
      'Will USA win World Cup 2026?',
      'Will Djokovic win another Grand Slam?',
    ],
    entertainment: [
      'Will Avatar 3 gross over $2B?',
      'Will GTA 6 release in 2025?',
      'Will a new Marvel movie break records?',
      'Will Netflix stock hit $1000?',
      'Will TikTok be banned in USA?',
    ],
  }

  const categoryQuestions = questions[category as keyof typeof questions] || questions.crypto
  const question = categoryQuestions[id % categoryQuestions.length]

  const baseVolume = Math.random() * 5000000 + 100000
  const yesPrice = 0.2 + Math.random() * 0.6
  const noPrice = 1 - yesPrice

  return {
    id: `market-${id}`,
    question,
    description: `This market resolves to YES if ${question.toLowerCase()}`,
    image: `https://picsum.photos/seed/${id}/200/200`,
    icon: `https://picsum.photos/seed/${id}/50/50`,
    active: true,
    closed: false,
    archived: false,
    new: Math.random() > 0.8,
    featured: Math.random() > 0.7,
    submitted_by: `0x${Math.random().toString(16).slice(2, 42)}`,
    resolved: false,
    volume: baseVolume.toString(),
    volume24hr: (baseVolume * (0.1 + Math.random() * 0.3)).toString(),
    liquidity: (baseVolume * (1 + Math.random())).toString(),
    end_date_iso: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    game_start_time: null,
    seconds_delay: 0,
    fpmm: `0x${Math.random().toString(16).slice(2, 42)}`,
    maker_base_fee: 0,
    taker_base_fee: 0,
    spread_fee: 0,
    neg_risk: false,
    neg_risk_market_id: null,
    neg_risk_request_id: null,
    accepting_orders: true,
    accepting_order_timestamp: new Date().toISOString(),
    minimum_tick_size: 0.01,
    minimum_order_size: 1,
    outcomes: [
      {
        id: `outcome-yes-${id}`,
        price: yesPrice.toString(),
        size: (Math.random() * 100000).toString(),
        price_change_percent: (Math.random() * 20 - 10),
      },
      {
        id: `outcome-no-${id}`,
        price: noPrice.toString(),
        size: (Math.random() * 100000).toString(),
        price_change_percent: (Math.random() * 20 - 10),
      },
    ],
    tokens: [
      {
        token_id: `token-yes-${id}`,
        outcome: 'YES',
        price: yesPrice.toString(),
        winner: false,
      },
      {
        token_id: `token-no-${id}`,
        outcome: 'NO',
        price: noPrice.toString(),
        winner: false,
      },
    ],
    markets: id % 3 === 0 ? generateSubMarkets(id, 4) : [], // 每3个市场中有1个有子市场
    enable_order_book: true,
    order_price_minimum: 0.01,
    order_price_maximum: 0.99,
    market_slug: question.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    minimum_order_size_usd: 1,
    tags: [category],
    condition_id: `condition-${id}`,
    question_id: `question-${id}`,
    notification_threshold: 0.1,
    rewards: null,
    cyom: false,
    comment_count: Math.floor(Math.random() * 100),
    clob_token_ids: [`token-yes-${id}`, `token-no-${id}`],
  }
}

// 生成 Mock 市场列表
export function getMockMarkets(count = 50): Market[] {
  const categories = ['crypto', 'politics', 'sports', 'entertainment']
  const markets: Market[] = []

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length]
    markets.push(generateMockMarket(i, category))
  }

  // 按 24h 交易量排序
  return markets.sort((a, b) => parseFloat(b.volume24hr) - parseFloat(a.volume24hr))
}

// 生成 Mock 订单簿
export function getMockOrderBook(tokenId: string): OrderBook {
  const basePrice = 0.5 + (Math.random() - 0.5) * 0.4
  const bids: Array<{ price: string; size: string }> = []
  const asks: Array<{ price: string; size: string }> = []

  // 生成买盘
  for (let i = 0; i < 20; i++) {
    const price = basePrice - i * 0.01 - Math.random() * 0.005
    const size = Math.random() * 50000 + 1000
    bids.push({
      price: Math.max(0.01, price).toFixed(4),
      size: size.toFixed(2),
    })
  }

  // 生成卖盘
  for (let i = 0; i < 20; i++) {
    const price = basePrice + 0.01 + i * 0.01 + Math.random() * 0.005
    const size = Math.random() * 50000 + 1000
    asks.push({
      price: Math.min(0.99, price).toFixed(4),
      size: size.toFixed(2),
    })
  }

  return {
    market: `market-${tokenId}`,
    asset_id: tokenId,
    timestamp: Date.now(),
    hash: `0x${Math.random().toString(16).slice(2)}`,
    bids,
    asks,
  }
}

// 生成 Mock 价格历史
export function getMockPriceHistory(_tokenId: string, points = 100): PriceHistory[] {
  const history: PriceHistory[] = []
  let price = 0.5 + (Math.random() - 0.5) * 0.3

  const now = Date.now()
  const interval = (24 * 60 * 60 * 1000) / points // 24小时

  for (let i = 0; i < points; i++) {
    // 随机游走
    price += (Math.random() - 0.5) * 0.02
    price = Math.max(0.05, Math.min(0.95, price))

    history.push({
      t: Math.floor((now - (points - i) * interval) / 1000),
      p: price,
    })
  }

  return history
}

// Mock API 延迟
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock Gamma API
export const mockGammaAPI = {
  async getMarkets(params?: any) {
    await delay(300 + Math.random() * 200)
    const markets = getMockMarkets(params?.limit || 50)

    if (params?.tag) {
      return markets.filter(m => m.tags.includes(params.tag))
    }

    return markets
  },

  async getMarketBySlug(slug: string) {
    await delay(200 + Math.random() * 100)
    const markets = getMockMarkets(50)
    return markets.find(m => m.market_slug === slug) || markets[0]
  },

  async getFeaturedMarkets(limit = 20) {
    await delay(300 + Math.random() * 200)
    return getMockMarkets(100).filter(m => m.featured).slice(0, limit)
  },

  async searchMarkets(query: string, limit = 20) {
    await delay(400 + Math.random() * 200)
    const markets = getMockMarkets(100)
    return markets
      .filter(m =>
        m.question.toLowerCase().includes(query.toLowerCase()) ||
        m.description.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
  },
}

// Mock CLOB API
// 生成 Mock 用户 Profile
function generateMockUserProfile(address: string): UserProfile {
  const realized = (Math.random() - 0.4) * 100000
  const unrealized = (Math.random() - 0.5) * 50000
  const totalPnl = realized + unrealized
  const initialInvestment = 50000
  const roi = (totalPnl / initialInvestment) * 100

  // Generate profit history (last 30 days)
  const history = []
  let currentProfit = 0
  for (let i = 30; i >= 0; i--) {
    currentProfit += (Math.random() - 0.48) * 3000
    history.push({
      timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
      profit: currentProfit,
    })
  }

  return {
    address,
    balance: 50000 + Math.random() * 200000,
    stats: {
      marketsCount: Math.floor(Math.random() * 80 + 20),
      totalTrades: Math.floor(Math.random() * 400 + 100),
      totalVolume: Math.random() * 2000000 + 500000,
      avgTradeSize: Math.random() * 10000 + 1000,
      bestTrade: Math.random() * 30000 + 5000,
      worstTrade: -(Math.random() * 15000 + 2000),
      avgHoldingTime: `${Math.floor(Math.random() * 10 + 2)}d ${Math.floor(Math.random() * 24)}h`,
      winRate: 0.45 + Math.random() * 0.3, // 45-75%
    },
    pnl: {
      realized,
      unrealized,
      roi,
      roi1d: (Math.random() - 0.5) * 10,
      roi7d: (Math.random() - 0.5) * 30,
      roi30d: (Math.random() - 0.5) * 80,
      history,
    },
    categories: {
      crypto: Math.random() * 0.6 + 0.2, // 20-80%
      politics: Math.random() * 0.4 + 0.1,
      sports: Math.random() * 0.3 + 0.05,
      entertainment: Math.random() * 0.2 + 0.05,
      finance: Math.random() * 0.15,
    },
    behavior: {
      smartMoney: Math.random() * 0.5 + 0.3, // 30-80%
      trendFollower: Math.random() * 0.6 + 0.2,
      contrarian: Math.random() * 0.4 + 0.1,
      noiseTrader: Math.random() * 0.3,
    },
  }
}

export const mockCLOBAPI = {
  async getOrderBook(tokenId: string) {
    await delay(200 + Math.random() * 100)
    return getMockOrderBook(tokenId)
  },

  async getPriceHistory(tokenId: string, params?: any) {
    await delay(300 + Math.random() * 200)
    const points = params?.fidelity || 100
    return getMockPriceHistory(tokenId, points)
  },

  async getUserProfile(address: string) {
    await delay(400 + Math.random() * 200)
    return generateMockUserProfile(address)
  },
}
