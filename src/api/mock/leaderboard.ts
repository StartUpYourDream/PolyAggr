/**
 * Mock 数据服务 - 排行榜数据
 */

export interface LeaderboardUser {
  rank: number
  address: string
  balance: number
  portfolioValue: number
  pnl7d: number  // 7日盈亏金额
  roi7d: number  // 7日ROI
  pnl30d: number  // 30日盈亏金额
  roi30d: number  // 30日ROI
  pnlTotal: number  // 总盈亏金额
  roiTotal: number  // 总ROI
  winRate: number
  buyCount: number
  sellCount: number
}

// 生成随机地址
function generateAddress(): string {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)]
  }
  return address
}

// 生成排行榜用户数据
function generateLeaderboardUser(rank: number): LeaderboardUser {
  // 排名越高，数据越好
  const baseMultiplier = Math.max(1, 100 / rank)
  const randomFactor = 0.7 + Math.random() * 0.6 // 0.7-1.3

  const balance = Math.floor((50000 + Math.random() * 200000) * baseMultiplier * randomFactor)
  const portfolioValue = Math.floor((100000 + Math.random() * 500000) * baseMultiplier * randomFactor)

  // 计算 ROI 和对应的盈亏金额
  const roi7d = (Math.random() * 40 - 10) * baseMultiplier * 0.3 // -10% to 30%
  const roi30d = (Math.random() * 80 - 20) * baseMultiplier * 0.4 // -20% to 60%
  const roiTotal = (Math.random() * 200 - 30) * baseMultiplier * 0.5 // -30% to 170%

  // 根据 ROI 计算盈亏金额（基于组合价值）
  const pnl7d = (portfolioValue * roi7d) / 100
  const pnl30d = (portfolioValue * roi30d) / 100
  const pnlTotal = (portfolioValue * roiTotal) / 100

  return {
    rank,
    address: generateAddress(),
    balance,
    portfolioValue,
    pnl7d,
    roi7d,
    pnl30d,
    roi30d,
    pnlTotal,
    roiTotal,
    winRate: Math.min(95, 40 + Math.random() * 40 + (baseMultiplier - 1) * 5), // 40%-95%
    buyCount: Math.floor((50 + Math.random() * 300) * baseMultiplier * randomFactor),
    sellCount: Math.floor((30 + Math.random() * 200) * baseMultiplier * randomFactor),
  }
}

// 生成排行榜数据
export function generateLeaderboardData(count: number = 100): LeaderboardUser[] {
  const users: LeaderboardUser[] = []

  for (let i = 1; i <= count; i++) {
    users.push(generateLeaderboardUser(i))
  }

  return users
}

// 导出默认的排行榜数据（100个用户）
export const mockLeaderboardData = generateLeaderboardData(100)
