import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getOrderBook, getOrderBooks } from '../api'
import { polymarketWS } from '../api'
import type { OrderBook } from '../types'

/**
 * 获取订单簿（REST API）
 */
export function useOrderBook(tokenId: string | undefined) {
  return useQuery({
    queryKey: ['orderbook', tokenId],
    queryFn: () => (tokenId ? getOrderBook(tokenId) : Promise.resolve(null)),
    enabled: !!tokenId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 10, // Refetch every 10 seconds
  })
}

/**
 * 获取多个订单簿
 */
export function useOrderBooks(tokenIds: string[]) {
  return useQuery({
    queryKey: ['orderbooks', tokenIds],
    queryFn: () => getOrderBooks(tokenIds),
    enabled: tokenIds.length > 0,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 10,
  })
}

/**
 * 实时订单簿（WebSocket）
 */
export function useRealtimeOrderBook(tokenId: string | undefined) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!tokenId) return

    // 连接 WebSocket
    polymarketWS.connect()
    setIsConnected(true)

    // 订阅订单簿更新
    const unsubscribe = polymarketWS.subscribeOrderBook(tokenId, (data) => {
      setOrderBook(data)
    })

    // 清理
    return () => {
      unsubscribe()
      // 如果没有其他订阅，断开连接
      // polymarketWS.disconnect()
    }
  }, [tokenId])

  return { orderBook, isConnected }
}
