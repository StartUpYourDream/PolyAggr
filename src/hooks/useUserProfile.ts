import { useQuery } from '@tanstack/react-query'
import { getUserPositions, getUserTrades, getUserProfile } from '../api'

/**
 * 获取用户持仓
 */
export function useUserPositions(address: string | undefined) {
  return useQuery({
    queryKey: ['user-positions', address],
    queryFn: () => (address ? getUserPositions(address) : Promise.resolve([])),
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * 获取用户交易历史
 */
export function useUserTrades(address: string | undefined, limit = 100) {
  return useQuery({
    queryKey: ['user-trades', address, limit],
    queryFn: () => (address ? getUserTrades(address, limit) : Promise.resolve([])),
    enabled: !!address,
    staleTime: 1000 * 30,
  })
}

/**
 * 获取用户完整 Profile（包含统计、PnL、分类、行为分析）
 */
export function useUserProfile(address: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', address],
    queryFn: () => (address ? getUserProfile(address) : Promise.resolve(null)),
    enabled: !!address,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60,
  })
}

/**
 * 计算用户 PnL
 */
export function calculateUserPnL(positions: any[], trades: any[]) {
  let realizedPnL = 0
  let unrealizedPnL = 0

  // 简化计算（实际需要更复杂的逻辑）
  positions.forEach((_position) => {
    // const value = parseFloat(position.value) || 0
    // const size = parseFloat(position.size) || 0

    // 这里需要根据买入价格计算未实现盈亏
    // unrealizedPnL += (currentPrice - avgBuyPrice) * size
  })

  trades.forEach((_trade) => {
    // 计算已实现盈亏
    // realizedPnL += profit from closed positions
  })

  return { realizedPnL, unrealizedPnL }
}
