import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export interface RadarDataPoint {
  label: string
  value: number // 0-100
}

interface RadarChartProps {
  data: RadarDataPoint[]
  title: string
  height?: number
  color?: string
}

export function RadarChart({ data, title, height = 300, color = '#00d395' }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Calculate center and radius
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) - 60 // Leave space for labels

    const angleStep = (Math.PI * 2) / data.length

    // Draw background circles (5 levels)
    ctx.strokeStyle = '#22262f'
    ctx.lineWidth = 1

    for (let i = 1; i <= 5; i++) {
      const r = (radius / 5) * i
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axis lines
    ctx.strokeStyle = '#22262f'
    ctx.lineWidth = 1

    data.forEach((_, index) => {
      const angle = angleStep * index - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    // Draw data polygon
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.fillStyle = `${color}40` // Add transparency

    ctx.beginPath()

    data.forEach((point, index) => {
      const angle = angleStep * index - Math.PI / 2
      const value = Math.max(0, Math.min(100, point.value)) / 100 // Normalize to 0-1
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.closePath()
    ctx.stroke()
    ctx.fill()

    // Draw data points
    data.forEach((point, index) => {
      const angle = angleStep * index - Math.PI / 2
      const value = Math.max(0, Math.min(100, point.value)) / 100
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px sans-serif'

    data.forEach((point, index) => {
      const angle = angleStep * index - Math.PI / 2
      const labelRadius = radius + 30
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)

      // Adjust text alignment based on position
      if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle - Math.PI) < Math.PI / 4) {
        ctx.textAlign = angle > 0 ? 'left' : 'right'
      } else {
        ctx.textAlign = 'center'
      }

      ctx.textBaseline = 'middle'
      ctx.fillText(point.label, x, y)

      // Draw value below label
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px monospace'
      ctx.fillText(`${point.value.toFixed(0)}%`, x, y + 15)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px sans-serif'
    })
  }, [data, color])

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-dark-700 rounded-lg"
        style={{ height }}
      >
        <span className="text-gray-500">No data available</span>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-dark-700 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </motion.div>
    </div>
  )
}
