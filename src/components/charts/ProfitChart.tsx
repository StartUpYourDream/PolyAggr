import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { UserPnL } from '../../types'

interface ProfitChartProps {
  data: UserPnL['history']
  height?: number
}

export function ProfitChart({ data, height = 300 }: ProfitChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; profit: number; date: string } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for retina display
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate profit range
    const profits = data.map(d => d.profit)
    const minProfit = Math.min(...profits, 0) // Ensure 0 is included
    const maxProfit = Math.max(...profits, 0)
    const profitRange = maxProfit - minProfit || 100

    // Draw grid lines
    ctx.strokeStyle = '#22262f'
    ctx.lineWidth = 1

    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
      const y = (rect.height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Vertical grid lines (10 lines)
    for (let i = 0; i <= 10; i++) {
      const x = (rect.width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    // Draw zero line (if applicable)
    if (minProfit < 0 && maxProfit > 0) {
      const zeroY = rect.height - ((0 - minProfit) / profitRange) * rect.height
      ctx.strokeStyle = '#4b5563'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(0, zeroY)
      ctx.lineTo(rect.width, zeroY)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Determine line color based on final profit
    const finalProfit = profits[profits.length - 1]
    const lineColor = finalProfit >= 0 ? '#00d395' : '#ff4757'
    const gradientColor = finalProfit >= 0
      ? 'rgba(0, 211, 149, 0.2)'
      : 'rgba(255, 71, 87, 0.2)'

    // Draw profit line
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * rect.width
      const y = rect.height - ((point.profit - minProfit) / profitRange) * rect.height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient.addColorStop(0, gradientColor)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * rect.width
      const y = rect.height - ((point.profit - minProfit) / profitRange) * rect.height

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

    // Draw profit labels
    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px monospace'
    ctx.textAlign = 'right'

    for (let i = 0; i <= 5; i++) {
      const profit = minProfit + (profitRange / 5) * i
      const y = rect.height - (rect.height / 5) * i
      const label = profit >= 0 ? `+$${profit.toFixed(0)}` : `-$${Math.abs(profit).toFixed(0)}`
      ctx.fillText(label, rect.width - 5, y - 5)
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

    // Calculate profit range for Y position
    const profits = data.map(d => d.profit)
    const minProfit = Math.min(...profits, 0)
    const maxProfit = Math.max(...profits, 0)
    const profitRange = maxProfit - minProfit || 100

    const pointY = rect.height - ((point.profit - minProfit) / profitRange) * rect.height
    const pointX = (clampedIndex / (data.length - 1)) * rect.width

    setHoveredPoint({
      x: pointX,
      y: pointY,
      profit: point.profit,
      date: new Date(point.timestamp).toLocaleDateString(),
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
        <span className="text-gray-500">No profit data available</span>
      </div>
    )
  }

  const latestProfit = data[data.length - 1]?.profit || 0
  const isPositive = latestProfit >= 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Profit & Loss Curve</h3>
        <div className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? '+' : ''}${latestProfit.toFixed(2)}
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
                {hoveredPoint.date}
              </div>
              <div className={`text-lg font-bold font-mono ${
                hoveredPoint.profit >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {hoveredPoint.profit >= 0 ? '+' : ''}${hoveredPoint.profit.toFixed(2)}
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
              className={`absolute w-2 h-2 rounded-full border-2 border-dark-900 pointer-events-none ${
                hoveredPoint.profit >= 0 ? 'bg-success' : 'bg-danger'
              }`}
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
