import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'zh' | 'en'

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'zh',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage',
    }
  )
)

// Translation function
export function t(key: string): string {
  const { locale } = useI18n.getState()
  const translations = locale === 'zh' ? zhTranslations : enTranslations

  const keys = key.split('.')
  let value: any = translations

  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }

  return value as string
}

// Hook for reactive translations
export function useTranslation() {
  const { locale } = useI18n()
  return {
    t: (key: string) => {
      const translations = locale === 'zh' ? zhTranslations : enTranslations
      const keys = key.split('.')
      let value: any = translations

      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) {
          console.warn(`Translation key not found: ${key}`)
          return key
        }
      }

      return value as string
    },
    locale,
  }
}

// Chinese translations
const zhTranslations = {
  common: {
    loading: '加载中...',
    error: '错误',
    noData: '暂无数据',
    search: '搜索',
    all: '所有',
    active: '活跃',
    closed: '已关闭',
    other: '其他',
    recentSearches: '最近搜索',
    clear: '清空',
  },
  nav: {
    trending: '热门',
    search: '搜索',
    userDetail: '用户详情',
  },
  market: {
    notFound: '市场未找到',
    notFoundDesc: '您查找的市场不存在',
    endDate: '结束于',
    subEvent: '子事件',
    allSubEvents: '所有子事件',
    orderBook: '订单簿',
    yesOrderBook: 'YES 订单簿',
    noOrderBookTitle: 'NO 订单簿',
    noOrderBook: '暂无订单簿数据',
    noPriceData: '暂无价格数据',
    tradeOn: '在 Polymarket 交易',
  },
  orderBook: {
    latestPrice: '最新价格',
    spread: '价差',
  },
  stats: {
    volume24h: '24小时交易量',
    openInterest: '持仓量',
    bidDepth: '买盘深度',
    askDepth: '卖盘深度',
    depthSkew: '深度偏斜',
    priceChange24h: '24小时涨跌',
    yesPrice: 'Yes 价格',
    noPrice: 'No 价格',
  },
  tabs: {
    activity: '交易记录',
    holders: '持仓者',
    traders: '顶级交易者',
  },
  table: {
    address: '地址',
    shares: '份额',
    value: '价值',
    avgBuyPrice: '买入均价',
    avgSellPrice: '卖出均价',
    realizedPnl: '已实现盈亏',
    realizedRoi: '已实现回报率',
    unrealizedPnl: '未实现盈亏',
    unrealizedRoi: '未实现回报率',
    time: '时间',
    type: '类型',
    price: '价格',
    total: '总计',
    txHash: '交易哈希',
    buy: '买入',
    sell: '卖出',
    yes: '是',
    no: '否',
    eventName: '事件名称',
    endDate: '结束日期',
    countdown: '倒计时',
    firstTrade: '首次交易',
    status: '状态',
    buyCount: '买入次数',
    sellCount: '卖出次数',
    active: '活跃',
    closed: '已关闭',
    settled: '已结算',
    holdingDays: '持仓天数',
    days: '天',
  },
  user: {
    profile: '用户概览',
    totalProfit: '总盈亏',
    totalVolume: '总交易量',
    activePositions: '活跃持仓',
    winRate: '胜率',
    profitChart: '盈亏趋势',
    radarChart: '交易能力分析',
    positions: '持仓',
    history: '交易历史',
    analytics: '分析',
    profitability: '盈利能力',
    activeness: '活跃度',
    diversification: '多样化',
    riskManagement: '风险管理',
    timing: '时机把握',
    consistency: '稳定性',
    notFound: '未找到用户',
    notFoundDesc: '您查找的用户资料不存在',
    usdcBalance: 'USDC 余额',
    pnl: '盈亏',
    categoryAnalysis: '类别分析',
    behaviorAnalysis: '行为分析',
    riskPreference: '风险偏好',
    beliefAnalysis: '信念偏好',
    smartMoney: '聪明钱',
    trendFollower: '趋势跟随者',
    contrarian: '逆向交易者',
    noiseTrader: '噪音交易者',
    crypto: '加密货币',
    politics: '政治',
    sports: '体育',
    entertainment: '娱乐',
    finance: '金融',
    highRisk: '高风险',
    mediumRisk: '中等风险',
    lowRisk: '低风险',
    conservative: '保守型',
    longTerm: '长期',
    shortTerm: '短期',
    momentum: '动量',
    valueInvesting: '价值',
    holdings: '持仓',
    tradeHistory: '交易历史',
    activityLog: '活动记录',
    aiSummary: 'AI 总结',
    aiDescription: '该地址展现出典型的聪明钱特征，擅长在市场趋势早期介入。交易行为偏向高风险高回报策略，主要活跃于加密货币和政治类预测市场。持仓周期较短，属于短期交易者，具有较强的市场敏感度和执行力。整体风险偏好激进，但盈利能力突出。',
    pnlDistribution: '盈亏占比',
    marketsParticipated: '参与市场数',
    totalTrades: '总交易次数',
    totalVolumeStat: '总成交量',
    avgTradePrice: '平均成交价',
    avgHoldingTime: '平均持仓时间',
    maxProfit: '历史最赚钱单笔盈利',
    maxLoss: '历史最亏钱单笔亏损',
    minutesAgo: '分钟前',
  },
  timeRange: {
    '1d': '1天',
    '1w': '1周',
    '1m': '1月',
    '3m': '3月',
    '1y': '1年',
    all: '全部',
  },
  trending: {
    title: '热门市场',
    description: '来自 Polymarket 的实时预测市场数据',
    markets: '个市场',
    category: '分类',
    event: '事件',
    yes: '是',
    no: '否',
    oiChange: '持仓变化',
    change1h: '1小时',
    change24h: '24小时',
    endsAt: '结束于',
    loadingMarkets: '加载市场中...',
    loadError: '加载市场失败',
    unknownError: '未知错误',
    noMarketsFound: '该分类下未找到市场',
  },
  search: {
    searchResults: '搜索结果',
    resultsFor: '的搜索结果',
    enterKeyword: '请输入搜索关键词',
    events: '事件',
    searching: '搜索中...',
    results: '个结果',
    noEventsFound: '未找到与',
    matching: '匹配的事件',
    users: '用户',
    noUsersFound: '未找到用户',
    balance: '余额',
    roi: '回报率',
    tip: '提示:',
    tipMessage: '输入以 "0x" 开头的钱包地址可以搜索用户',
    startSearching: '开始搜索',
    searchDescription: '使用上方搜索栏查找预测市场或用户资料。您可以按事件名称、关键词或钱包地址搜索。',
  },
}

// English translations
const enTranslations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    noData: 'No data',
    search: 'Search',
    all: 'All',
    active: 'Active',
    closed: 'Closed',
    other: 'Other',
    recentSearches: 'Recent Searches',
    clear: 'Clear',
  },
  nav: {
    trending: 'Trending',
    search: 'Search',
    userDetail: 'User Profile',
  },
  market: {
    notFound: 'Market Not Found',
    notFoundDesc: 'The market you are looking for does not exist',
    endDate: 'Ends at',
    subEvent: 'Sub-event',
    allSubEvents: 'All Sub-events',
    orderBook: 'Order Book',
    yesOrderBook: 'YES Order Book',
    noOrderBookTitle: 'NO Order Book',
    noOrderBook: 'No order book data',
    noPriceData: 'No price data',
    tradeOn: 'Trade on Polymarket',
  },
  orderBook: {
    latestPrice: 'Latest Price',
    spread: 'Spread',
  },
  stats: {
    volume24h: '24h Volume',
    openInterest: 'Open Interest',
    bidDepth: 'Bid Depth',
    askDepth: 'Ask Depth',
    depthSkew: 'Depth Skew',
    priceChange24h: '24h Change',
    yesPrice: 'Yes Price',
    noPrice: 'No Price',
  },
  tabs: {
    activity: 'Activity',
    holders: 'Holders',
    traders: 'Top Traders',
  },
  table: {
    address: 'Address',
    shares: 'Shares',
    value: 'Value',
    avgBuyPrice: 'Avg Buy Price',
    avgSellPrice: 'Avg Sell Price',
    realizedPnl: 'Realized P&L',
    realizedRoi: 'Realized ROI',
    unrealizedPnl: 'Unrealized P&L',
    unrealizedRoi: 'Unrealized ROI',
    time: 'Time',
    type: 'Type',
    price: 'Price',
    total: 'Total',
    txHash: 'Tx Hash',
    buy: 'Buy',
    sell: 'Sell',
    yes: 'Yes',
    no: 'No',
    eventName: 'Event Name',
    endDate: 'End Date',
    countdown: 'Countdown',
    firstTrade: 'First Trade',
    status: 'Status',
    buyCount: 'Buy Count',
    sellCount: 'Sell Count',
    active: 'Active',
    closed: 'Closed',
    settled: 'Settled',
    holdingDays: 'Holding Days',
    days: 'days',
  },
  user: {
    profile: 'User Profile',
    totalProfit: 'Total P&L',
    totalVolume: 'Total Volume',
    activePositions: 'Active Positions',
    winRate: 'Win Rate',
    profitChart: 'P&L Trend',
    radarChart: 'Trading Ability Analysis',
    positions: 'Positions',
    history: 'History',
    analytics: 'Analytics',
    profitability: 'Profitability',
    activeness: 'Activeness',
    diversification: 'Diversification',
    riskManagement: 'Risk Management',
    timing: 'Timing',
    consistency: 'Consistency',
    notFound: 'User Not Found',
    notFoundDesc: 'The user profile you are looking for does not exist',
    usdcBalance: 'USDC Balance',
    pnl: 'P&L',
    categoryAnalysis: 'Category Analysis',
    behaviorAnalysis: 'Behavior Analysis',
    riskPreference: 'Risk Preference',
    beliefAnalysis: 'Belief Preference',
    smartMoney: 'Smart Money',
    trendFollower: 'Trend Follower',
    contrarian: 'Contrarian',
    noiseTrader: 'Noise Trader',
    crypto: 'Crypto',
    politics: 'Politics',
    sports: 'Sports',
    entertainment: 'Entertainment',
    finance: 'Finance',
    highRisk: 'High Risk',
    mediumRisk: 'Medium Risk',
    lowRisk: 'Low Risk',
    conservative: 'Conservative',
    longTerm: 'Long Term',
    shortTerm: 'Short Term',
    momentum: 'Momentum',
    valueInvesting: 'Value',
    holdings: 'Holdings',
    tradeHistory: 'Trade History',
    activityLog: 'Activity Log',
    aiSummary: 'AI Summary',
    aiDescription: 'This address exhibits typical smart money characteristics, excelling at entering market trends early. Trading behavior leans towards high-risk high-reward strategies, primarily active in cryptocurrency and politics prediction markets. Short holding periods, classified as a short-term trader with strong market sensitivity and execution. Overall risk appetite is aggressive, but profitability is outstanding.',
    pnlDistribution: 'P&L Distribution',
    marketsParticipated: 'Markets Participated',
    totalTrades: 'Total Trades',
    totalVolumeStat: 'Total Volume',
    avgTradePrice: 'Avg Trade Price',
    avgHoldingTime: 'Avg Holding Time',
    maxProfit: 'Max Single Profit',
    maxLoss: 'Max Single Loss',
    minutesAgo: 'minutes ago',
  },
  timeRange: {
    '1d': '1D',
    '1w': '1W',
    '1m': '1M',
    '3m': '3M',
    '1y': '1Y',
    all: 'All',
  },
  trending: {
    title: 'Trending Markets',
    description: 'Real-time prediction market data from Polymarket',
    markets: 'markets',
    category: 'Category',
    event: 'Event',
    yes: 'Yes',
    no: 'No',
    oiChange: 'OI Change',
    change1h: '1H',
    change24h: '24H',
    endsAt: 'Ends at',
    loadingMarkets: 'Loading markets...',
    loadError: 'Failed to load markets',
    unknownError: 'Unknown error',
    noMarketsFound: 'No markets found in this category',
  },
  search: {
    searchResults: 'Search Results',
    resultsFor: 'Search results for',
    enterKeyword: 'Enter search keywords',
    events: 'Events',
    searching: 'Searching...',
    results: 'results',
    noEventsFound: 'No events found matching',
    matching: '',
    users: 'Users',
    noUsersFound: 'No users found',
    balance: 'Balance',
    roi: 'ROI',
    tip: 'Tip:',
    tipMessage: 'Enter a wallet address starting with "0x" to search for users',
    startSearching: 'Start Searching',
    searchDescription: 'Use the search bar above to find prediction markets or user profiles. You can search by event name, keywords, or wallet address.',
  },
}
