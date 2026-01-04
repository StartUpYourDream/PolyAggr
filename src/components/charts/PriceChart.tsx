import { motion } from 'framer-motion'
import { useState } from 'react'
import type { PriceHistory } from '../../types'
import { formatTimestamp } from '../../utils/format'
import { useTranslation } from '../../i18n'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

interface PriceChartProps {
  data: PriceHistory[] | PriceHistory[][]  // Support single series or multiple series
  height?: number
  multiLine?: boolean  // Whether to show multiple lines
  lineColors?: string[]  // Colors for each line
}

export function PriceChart({
  data,
  height = 400,
  multiLine = false,
  lineColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
}: PriceChartProps) {
  const { t } = useTranslation()
  const [selectedInterval, setSelectedInterval] = useState('1d')

  const intervals = ['1s', '1m', '5m', '1h', '1d', '1w']

  // Check if data is empty
  const isEmpty = multiLine
    ? (Array.isArray(data) && (data.length === 0 || (data as PriceHistory[][]).every(series => series.length === 0)))
    : (Array.isArray(data) && data.length === 0)

  if (isEmpty) {
    return (
      <div
        className="flex items-center justify-center bg-dark-700 dark:bg-dark-700 light:bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <span className="text-gray-500">{t('market.noPriceData')}</span>
      </div>
    )
  }

  let chartData: any[] = []
  let minPrice = 0
  let maxPrice = 100

  if (multiLine && Array.isArray(data[0])) {
    // Multiple series mode
    const allSeries = data as PriceHistory[][]

    // Get all unique timestamps
    const timestampSet = new Set<number>()
    allSeries.forEach(series => {
      series.forEach(point => timestampSet.add(point.t))
    })
    const timestamps = Array.from(timestampSet).sort((a, b) => a - b)

    // Create data points with all series
    chartData = timestamps.map(timestamp => {
      const point: any = { timestamp }
      allSeries.forEach((series, index) => {
        const dataPoint = series.find(p => p.t === timestamp)
        if (dataPoint) {
          point[`price${index}`] = dataPoint.p * 100
        }
      })
      return point
    })

    // Calculate price range across all series
    const allPrices = allSeries.flatMap(series => series.map(d => d.p * 100))
    minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
    maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 100
  } else {
    // Single series mode
    const singleData = data as PriceHistory[]
    chartData = singleData.map((point) => ({
      timestamp: point.t,
      price: point.p,
      displayPrice: point.p * 100,
    }))

    // Calculate price range
    const prices = singleData.map(d => d.p * 100)
    minPrice = Math.min(...prices)
    maxPrice = Math.max(...prices)
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const timestamp = payload[0].payload.timestamp

      if (multiLine) {
        // Show all series prices
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-900 dark:bg-dark-900 light:bg-white border border-dark-600 dark:border-dark-600 light:border-gray-200 rounded-lg px-3 py-2 shadow-xl"
          >
            <div className="text-xs text-gray-400 mb-2">
              {formatTimestamp(timestamp)}
            </div>
            <div className="space-y-1">
              {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-mono font-semibold" style={{ color: entry.color }}>
                    {entry.value?.toFixed(1)}¢
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )
      } else {
        // Single series
        const price = payload[0].payload.price
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-900 dark:bg-dark-900 light:bg-white border border-dark-600 dark:border-dark-600 light:border-gray-200 rounded-lg px-3 py-2 shadow-xl"
          >
            <div className="text-xs text-gray-400 mb-1">
              {formatTimestamp(timestamp)}
            </div>
            <div className="text-lg font-bold text-success font-mono">
              {(price * 100).toFixed(1)}¢
            </div>
          </motion.div>
        )
      }
    }
    return null
  }

  // Custom Y-axis tick component - no background needed
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const value = payload.value
    const label = `${value.toFixed(1)}¢`

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-5}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#9ca3af"
          fontSize={11}
          fontFamily="monospace"
        >
          {label}
        </text>
      </g>
    )
  }

  // Custom X-axis tick component
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={11}
          fontFamily="monospace"
        >
          {formatTimestamp(payload.value)}
        </text>
      </g>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex gap-2">
          {intervals.map((interval) => (
            <button
              key={interval}
              onClick={() => setSelectedInterval(interval)}
              className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer active:scale-95 ${
                selectedInterval === interval
                  ? 'bg-primary !text-white'
                  : 'bg-dark-700 dark:bg-dark-700 light:bg-gray-200 text-gray-400 dark:text-gray-400 light:text-gray-700 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-300 hover:text-gray-100 dark:hover:text-gray-100 light:hover:text-gray-900'
              }`}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-dark-700 dark:bg-dark-700 light:bg-gray-50 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, bottom: 25, left: 10 }}
          >
            <defs>
              {/* 移除渐变，不再使用阴影 */}
            </defs>

            {/* Remove grid */}

            <XAxis
              dataKey="timestamp"
              tick={<CustomXAxisTick />}
              stroke="#22262f"
              tickLine={false}
              interval={Math.floor(chartData.length / 6)}
            />

            <YAxis
              tick={<CustomYAxisTick />}
              stroke="#22262f"
              tickLine={false}
              domain={[minPrice, maxPrice]}
              tickCount={6}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'rgba(107, 114, 128, 0.3)',
                strokeWidth: 1,
              }}
              wrapperStyle={{ zIndex: 100 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />

            {multiLine ? (
              // Render multiple lines without shadow fill
              (data as PriceHistory[][]).map((_, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={`price${index}`}
                  stroke={lineColors[index % lineColors.length]}
                  strokeWidth={2}
                  fill="transparent"
                  activeDot={{
                    r: 4,
                    fill: lineColors[index % lineColors.length],
                    stroke: '#1a1d26',
                    strokeWidth: 2,
                  }}
                />
              ))
            ) : (
              // Single line without shadow fill
              <Area
                type="monotone"
                dataKey="displayPrice"
                stroke="#10b981"
                strokeWidth={2}
                fill="transparent"
                activeDot={{
                  r: 4,
                  fill: '#10b981',
                  stroke: '#1a1d26',
                  strokeWidth: 2,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
