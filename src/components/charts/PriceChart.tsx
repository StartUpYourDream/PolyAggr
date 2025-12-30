import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { PriceHistory } from '../../types'

interface PriceChartProps {
  data: PriceHistory[]
  height?: number
}

export function PriceChart({ data, height = 400 }: PriceChartProps) {
  const [selectedInterval, setSelectedInterval] = useState('1d')
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; time: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const intervals = ['1s', '1m', '5m', '1h', '1d', '1w']

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // 清空画布
    ctx.clearRect(0, 0, rect.width, rect.height)

    // 计算价格范围
    const prices = data.map(d => d.p)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 0.1

    // 绘制网格线
    ctx.strokeStyle = '#22262f'
    ctx.lineWidth = 1

    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = (rect.height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = (rect.width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    // 绘制价格线
    ctx.strokeStyle = '#00d395'
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * rect.width
      const y = rect.height - ((point.p - minPrice) / priceRange) * rect.height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 绘制渐变填充
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient.addColorStop(0, 'rgba(0, 211, 149, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 211, 149, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * rect.width
      const y = rect.height - ((point.p - minPrice) / priceRange) * rect.height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(rect.width, rect.height)
    ctx.lineTo(0, rect.height)
    ctx.closePath()
    ctx.fill()

    // 绘制价格标签
    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px monospace'
    ctx.textAlign = 'right'

    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * i
      const y = rect.height - (rect.height / 5) * i
      ctx.fillText((price * 100).toFixed(1) + '¢', rect.width - 5, y - 5)
    }
  }, [data])

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || data.length === 0) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find the closest data point
    const dataIndex = Math.round((x / rect.width) * (data.length - 1))
    const clampedIndex = Math.max(0, Math.min(data.length - 1, dataIndex))
    const point = data[clampedIndex]

    // Calculate price range for Y position
    const prices = data.map(d => d.p)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 0.1

    const pointY = rect.height - ((point.p - minPrice) / priceRange) * rect.height
    const pointX = (clampedIndex / (data.length - 1)) * rect.width

    setHoveredPoint({
      x: pointX,
      y: pointY,
      price: point.p,
      time: point.t,
    })
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-dark-700 rounded-lg"
        style={{ height }}
      >
        <span className="text-gray-500">No price data available</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Price Chart</h3>
        <div className="flex gap-2">
          {intervals.map((interval) => (
            <button
              key={interval}
              onClick={() => setSelectedInterval(interval)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedInterval === interval
                  ? 'bg-primary text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-gray-100'
              }`}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-dark-700 rounded-lg overflow-hidden"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Hover tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y - 60,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
              <div className="text-xs text-gray-400 mb-1">
                {new Date(hoveredPoint.time).toLocaleString()}
              </div>
              <div className="text-lg font-bold text-success font-mono">
                {(hoveredPoint.price * 100).toFixed(1)}¢
              </div>
            </div>
            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                top: '100%',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1a1d26',
              }}
            />
          </motion.div>
        )}

        {/* Crosshair */}
        {hoveredPoint && (
          <>
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-500/30 pointer-events-none"
              style={{ left: hoveredPoint.x }}
            />
            {/* Horizontal line */}
            <div
              className="absolute left-0 right-0 h-px bg-gray-500/30 pointer-events-none"
              style={{ top: hoveredPoint.y }}
            />
            {/* Dot */}
            <div
              className="absolute w-2 h-2 rounded-full bg-success border-2 border-dark-900 pointer-events-none"
              style={{
                left: hoveredPoint.x - 4,
                top: hoveredPoint.y - 4,
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  )
}
