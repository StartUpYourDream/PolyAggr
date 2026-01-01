/**
 * Polymarket WebSocket API
 * URL: wss://ws-subscriptions-clob.polymarket.com/ws
 * 用于实时订单簿更新
 */

import type { OrderBook } from '../../types'

type MessageHandler = (data: any) => void

export class PolymarketWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private handlers = new Map<string, Set<MessageHandler>>()
  private subscriptions = new Set<string>()

  constructor(private url = 'wss://ws-subscriptions-clob.polymarket.com/ws') {}

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('[WS] Connected to Polymarket WebSocket')
      this.reconnectAttempts = 0

      // 重新订阅之前的频道
      this.subscriptions.forEach(channel => {
        this.send({
          type: 'subscribe',
          channel,
        })
      })
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('[WS] Failed to parse message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error)
    }

    this.ws.onclose = () => {
      console.log('[WS] Disconnected')
      this.attemptReconnect()
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscriptions.clear()
    this.handlers.clear()
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * this.reconnectAttempts
      console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('[WS] Max reconnect attempts reached')
    }
  }

  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private handleMessage(data: any) {
    const { channel, data: payload } = data

    // 触发对应频道的所有处理器
    const channelHandlers = this.handlers.get(channel)
    if (channelHandlers) {
      channelHandlers.forEach(handler => handler(payload))
    }

    // 触发全局处理器
    const globalHandlers = this.handlers.get('*')
    if (globalHandlers) {
      globalHandlers.forEach(handler => handler(data))
    }
  }

  /**
   * 订阅订单簿更新
   * @param tokenId Token ID
   * @param handler 消息处理函数
   */
  subscribeOrderBook(tokenId: string, handler: (orderBook: OrderBook) => void) {
    const channel = `book:${tokenId}`

    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set())
    }

    this.handlers.get(channel)!.add(handler)
    this.subscriptions.add(channel)

    this.send({
      type: 'subscribe',
      channel,
    })

    // 返回取消订阅函数
    return () => {
      this.unsubscribeOrderBook(tokenId, handler)
    }
  }

  /**
   * 取消订阅订单簿
   */
  unsubscribeOrderBook(tokenId: string, handler: MessageHandler) {
    const channel = `book:${tokenId}`
    const channelHandlers = this.handlers.get(channel)

    if (channelHandlers) {
      channelHandlers.delete(handler)

      if (channelHandlers.size === 0) {
        this.handlers.delete(channel)
        this.subscriptions.delete(channel)

        this.send({
          type: 'unsubscribe',
          channel,
        })
      }
    }
  }

  /**
   * 订阅价格更新
   */
  subscribePrice(tokenId: string, handler: MessageHandler) {
    const channel = `price:${tokenId}`

    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set())
    }

    this.handlers.get(channel)!.add(handler)
    this.subscriptions.add(channel)

    this.send({
      type: 'subscribe',
      channel,
    })

    return () => {
      this.unsubscribePrice(tokenId, handler)
    }
  }

  unsubscribePrice(tokenId: string, handler: MessageHandler) {
    const channel = `price:${tokenId}`
    const channelHandlers = this.handlers.get(channel)

    if (channelHandlers) {
      channelHandlers.delete(handler)

      if (channelHandlers.size === 0) {
        this.handlers.delete(channel)
        this.subscriptions.delete(channel)

        this.send({
          type: 'unsubscribe',
          channel,
        })
      }
    }
  }

  /**
   * 订阅所有消息
   */
  onMessage(handler: MessageHandler) {
    if (!this.handlers.has('*')) {
      this.handlers.set('*', new Set())
    }

    this.handlers.get('*')!.add(handler)

    return () => {
      const globalHandlers = this.handlers.get('*')
      if (globalHandlers) {
        globalHandlers.delete(handler)
      }
    }
  }
}

// 单例实例
export const polymarketWS = new PolymarketWebSocket()
