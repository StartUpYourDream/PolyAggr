import { useQuery } from '@tanstack/react-query'
import { getMarkets, getMarketBySlug, getFeaturedMarkets, searchMarkets } from '../api'

/**
 * 获取市场列表
 */
export function useMarkets(params?: {
  limit?: number
  offset?: number
  active?: boolean
  closed?: boolean
  order?: 'volume' | 'liquidity' | 'end_date'
  ascending?: boolean
  tag?: string
}) {
  return useQuery({
    queryKey: ['markets', params],
    queryFn: () => getMarkets(params),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Auto refetch every minute
  })
}

/**
 * 获取单个市场详情
 */
export function useMarket(slug: string | undefined) {
  return useQuery({
    queryKey: ['market', slug],
    queryFn: () => (slug ? getMarketBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30,
  })
}

/**
 * 获取热门市场
 */
export function useFeaturedMarkets(limit = 20) {
  return useQuery({
    queryKey: ['markets', 'featured', limit],
    queryFn: () => getFeaturedMarkets(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * 搜索市场
 */
export function useSearchMarkets(query: string) {
  return useQuery({
    queryKey: ['markets', 'search', query],
    queryFn: () => searchMarkets(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60, // 1 minute
  })
}
