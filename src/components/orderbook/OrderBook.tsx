import { motion } from 'framer-motion'
import type { OrderBook as OrderBookType } from '../../types'
import { calculateSpread } from '../../utils'
import { useTranslation } from '../../i18n'

interface OrderBookProps {
  orderBook: OrderBookType
  maxLevels?: number
}

export function OrderBook({ orderBook, maxLevels = 10 }: OrderBookProps) {
  const { t } = useTranslation()
  const bids = orderBook.bids.slice(0, maxLevels)
  const asks = orderBook.asks.slice(0, maxLevels).reverse()

  // 计算最大深度用于可视化
  const maxSize = Math.max(
    ...bids.map(b => parseFloat(b.size)),
    ...asks.map(a => parseFloat(a.size))
  )

  const spread = calculateSpread(orderBook)
  const spreadPercent = orderBook.bids.length > 0 && orderBook.asks.length > 0
    ? (spread / parseFloat(orderBook.bids[0].price)) * 100
    : 0

  // 当前价格 = 最佳买价和卖价的中点
  const currentPrice = orderBook.bids.length > 0 && orderBook.asks.length > 0
    ? (parseFloat(orderBook.bids[0].price) + parseFloat(orderBook.asks[0].price)) / 2
    : 0.5

  return (
    <div className="flex flex-col h-full">
      {/* Asks (卖单) - 可滚动 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">
        <div className="flex flex-col-reverse space-y-reverse space-y-0.5">
          {asks.map((ask, index) => {
            const price = parseFloat(ask.price)
            const size = parseFloat(ask.size)
            const percentage = (size / maxSize) * 100

            return (
              <motion.div
                key={`ask-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="relative flex justify-between items-center text-xs py-0.5 px-2 rounded"
              >
                {/* 背景条 */}
                <div
                  className="absolute inset-0 bg-danger/10 rounded"
                  style={{ width: `${percentage}%`, right: 0, left: 'auto' }}
                />

                {/* 价格 */}
                <span className="relative text-danger font-mono tabular-nums">
                  {(price * 100).toFixed(1)}¢
                </span>

                {/* 数量 */}
                <span className="relative text-gray-400 font-mono tabular-nums">
                  {size >= 1000 ? `${(size / 1000).toFixed(1)}K` : size.toFixed(0)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 当前价格 - 固定在中间 */}
      <div className="py-2 border-y border-dark-600 flex items-center justify-between px-2 bg-dark-800">
        <div className="flex flex-col items-start">
          <div className="text-lg font-bold text-gray-100 font-mono tabular-nums">
            {(currentPrice * 100).toFixed(1)}¢
          </div>
          <div className="text-xs text-gray-500">{t('orderBook.latestPrice')}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-300 font-mono">
            {(spread * 100).toFixed(2)}¢
          </div>
          <div className="text-xs text-gray-500">{t('orderBook.spread')} ({spreadPercent.toFixed(2)}%)</div>
        </div>
      </div>

      {/* Bids (买单) - 可滚动 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">
        <div className="flex flex-col space-y-0.5">
          {bids.map((bid, index) => {
            const price = parseFloat(bid.price)
            const size = parseFloat(bid.size)
            const percentage = (size / maxSize) * 100

            return (
              <motion.div
                key={`bid-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="relative flex justify-between items-center text-xs py-0.5 px-2 rounded"
              >
                {/* 背景条 */}
                <div
                  className="absolute inset-0 bg-success/10 rounded"
                  style={{ width: `${percentage}%` }}
                />

                {/* 价格 */}
                <span className="relative text-success font-mono tabular-nums">
                  {(price * 100).toFixed(1)}¢
                </span>

                {/* 数量 */}
                <span className="relative text-gray-400 font-mono tabular-nums">
                  {size >= 1000 ? `${(size / 1000).toFixed(1)}K` : size.toFixed(0)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
