/**
 * Mock 数据服务 - Dashboard 数据
 */

export enum Platform {
  ALL = 'all',
  POLYMARKET = 'polymarket',
  KALSHI = 'kalshi',
  MANIFOLD = 'manifold',
}

export interface DashboardKPI {
  totalVolume: number
  volume24h: number
  totalUsers: number
  activeUsers: number
  totalMarkets: number
  activeMarkets: number
}

export interface VolumeDataPoint {
  date: string
  volume: number
}

export interface UserGrowthDataPoint {
  date: string
  users: number
}

export interface EventStatusData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export interface CategoryData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export interface HeatmapDataPoint {
  hour: number
  day: string
  value: number
}

export interface TopMarket {
  name: string
  volume: number
  change: number
}

export interface AvgReturnDataPoint {
  date: string
  return: number
}

export interface NewMarketsDataPoint {
  date: string
  markets: number
}

export interface LiquidityData {
  range: string
  count: number
  color: string
}

export interface VolumeByCategory {
  category: string
  volume: number
}

export interface DashboardData {
  kpi: DashboardKPI
  volumeTrend: VolumeDataPoint[]
  userGrowth: UserGrowthDataPoint[]
  eventStatus: EventStatusData[]
  categoryDistribution: CategoryData[]
  tradingHeatmap: HeatmapDataPoint[]
  topMarkets: TopMarket[]
  avgReturnTrend: AvgReturnDataPoint[]
  newMarketsTrend: NewMarketsDataPoint[]
  liquidityDistribution: LiquidityData[]
  volumeByCategory: VolumeByCategory[]
}

// 生成过去30天的日期
function getLast30Days(): string[] {
  const days: string[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().split('T')[0])
  }

  return days
}

// 生成交易量趋势数据
function generateVolumeTrend(): VolumeDataPoint[] {
  const days = getLast30Days()
  const baseVolume = 5000000

  return days.map((date, index) => ({
    date,
    volume: baseVolume + Math.random() * 3000000 + index * 50000, // 逐渐增长的趋势
  }))
}

// 生成用户增长数据
function generateUserGrowth(): UserGrowthDataPoint[] {
  const days = getLast30Days()
  const baseUsers = 50000

  return days.map((date, index) => ({
    date,
    users: Math.floor(baseUsers + index * 1500 + Math.random() * 500), // 稳定增长
  }))
}

// 生成事件状态分布
function generateEventStatus(): EventStatusData[] {
  return [
    { name: 'Active', value: 1245, color: '#6ee7b7' },
    { name: 'Closed', value: 3567, color: '#93c5fd' },
    { name: 'Resolved', value: 2891, color: '#c084fc' },
  ]
}

// 生成分类分布
function generateCategoryDistribution(): CategoryData[] {
  return [
    { name: 'Politics', value: 3245, color: '#fca5a5' },
    { name: 'Crypto', value: 2156, color: '#fdba74' },
    { name: 'Sports', value: 1876, color: '#86efac' },
    { name: 'Business', value: 987, color: '#93c5fd' },
    { name: 'Science', value: 654, color: '#c084fc' },
    { name: 'Entertainment', value: 432, color: '#f9a8d4' },
  ]
}

// 生成交易热力图数据
function generateTradingHeatmap(): HeatmapDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const heatmap: HeatmapDataPoint[] = []

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // 工作日白天交易量更高
      let baseValue = 100
      if (day < 5) { // 工作日
        if (hour >= 9 && hour <= 17) {
          baseValue = 500
        } else if (hour >= 18 && hour <= 22) {
          baseValue = 300
        }
      } else { // 周末
        if (hour >= 10 && hour <= 20) {
          baseValue = 250
        }
      }

      heatmap.push({
        hour,
        day: days[day],
        value: Math.floor(baseValue + Math.random() * 200),
      })
    }
  }

  return heatmap
}

// 生成热门市场
function generateTopMarkets(): TopMarket[] {
  const marketNames = [
    'Will Bitcoin reach $150k by end of 2025?',
    'Will Trump win 2024 election?',
    'Will Ethereum flip Bitcoin in 2025?',
    'Will AI achieve AGI by 2030?',
    'Will SpaceX land on Mars by 2026?',
    'Will fed cut rates in Q1 2025?',
    'Will Bitcoin ETF be approved?',
    'Will unemployment rate exceed 5%?',
    'Will inflation drop below 2%?',
    'Will China invade Taiwan by 2026?',
  ]

  return marketNames.map((name, index) => ({
    name,
    volume: Math.floor((10000000 - index * 800000) + Math.random() * 500000),
    change: (Math.random() * 60 - 20), // -20% to 40%
  }))
}

// 生成平均回报率趋势
function generateAvgReturnTrend(): AvgReturnDataPoint[] {
  const days = getLast30Days()

  return days.map((date, index) => ({
    date,
    return: 5 + Math.sin(index / 5) * 3 + Math.random() * 2, // 波动在2-10%之间
  }))
}

// 生成新增市场趋势
function generateNewMarketsTrend(): NewMarketsDataPoint[] {
  const days = getLast30Days()

  return days.map((date) => ({
    date,
    markets: Math.floor(15 + Math.random() * 25), // 每天15-40个新市场
  }))
}

// 生成流动性分布
function generateLiquidityDistribution(): LiquidityData[] {
  return [
    { range: '<$10k', count: 1245, color: '#fca5a5' },
    { range: '$10k-$50k', count: 876, color: '#fdba74' },
    { range: '$50k-$100k', count: 543, color: '#fde047' },
    { range: '$100k-$500k', count: 321, color: '#86efac' },
    { range: '$500k-$1M', count: 156, color: '#7dd3fc' },
    { range: '>$1M', count: 87, color: '#c084fc' },
  ]
}

// 生成分类交易量
function generateVolumeByCategory(): VolumeByCategory[] {
  return [
    { category: 'Politics', volume: 45000000 },
    { category: 'Crypto', volume: 32000000 },
    { category: 'Sports', volume: 28000000 },
    { category: 'Business', volume: 18000000 },
    { category: 'Science', volume: 12000000 },
    { category: 'Entertainment', volume: 8000000 },
  ]
}

// 生成不同平台的 Dashboard 数据
function generateDashboardData(platform: Platform): DashboardData {
  const multipliers: Record<Platform, number> = {
    [Platform.ALL]: 1.0,
    [Platform.POLYMARKET]: 0.6,
    [Platform.KALSHI]: 0.25,
    [Platform.MANIFOLD]: 0.15,
  }

  const multiplier = multipliers[platform]

  return {
    kpi: {
      totalVolume: Math.floor(12500000000 * multiplier),
      volume24h: Math.floor(85000000 * multiplier),
      totalUsers: Math.floor(156000 * multiplier),
      activeUsers: Math.floor(23400 * multiplier),
      totalMarkets: Math.floor(7850 * multiplier),
      activeMarkets: Math.floor(1245 * multiplier),
    },
    volumeTrend: generateVolumeTrend().map(d => ({
      ...d,
      volume: Math.floor(d.volume * multiplier),
    })),
    userGrowth: generateUserGrowth().map(d => ({
      ...d,
      users: Math.floor(d.users * multiplier),
    })),
    eventStatus: generateEventStatus().map(e => ({
      ...e,
      value: Math.floor(e.value * multiplier),
    })),
    categoryDistribution: generateCategoryDistribution().map(c => ({
      ...c,
      value: Math.floor(c.value * multiplier),
    })),
    tradingHeatmap: generateTradingHeatmap().map(h => ({
      ...h,
      value: Math.floor(h.value * multiplier),
    })),
    topMarkets: generateTopMarkets().map(m => ({
      ...m,
      volume: Math.floor(m.volume * multiplier),
    })),
    avgReturnTrend: generateAvgReturnTrend(),
    newMarketsTrend: generateNewMarketsTrend().map(d => ({
      ...d,
      markets: Math.floor(d.markets * multiplier),
    })),
    liquidityDistribution: generateLiquidityDistribution().map(l => ({
      ...l,
      count: Math.floor(l.count * multiplier),
    })),
    volumeByCategory: generateVolumeByCategory().map(v => ({
      ...v,
      volume: Math.floor(v.volume * multiplier),
    })),
  }
}

// 预生成各平台数据
export const mockDashboardData: Record<Platform, DashboardData> = {
  [Platform.ALL]: generateDashboardData(Platform.ALL),
  [Platform.POLYMARKET]: generateDashboardData(Platform.POLYMARKET),
  [Platform.KALSHI]: generateDashboardData(Platform.KALSHI),
  [Platform.MANIFOLD]: generateDashboardData(Platform.MANIFOLD),
}

// 导出获取数据的函数
export function getDashboardData(platform: Platform): DashboardData {
  return mockDashboardData[platform]
}
