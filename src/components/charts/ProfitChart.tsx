import { motion } from 'framer-motion'
import type { UserPnL } from '../../types'
import { formatDate } from '../../utils/format'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

interface ProfitChartProps {
  data: UserPnL['history']
  height?: number
}

export function ProfitChart({ data, height = 300 }: ProfitChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-dark-700 rounded-lg"
        style={{ height }}
      >
        <span className="text-gray-500">暂无盈亏数据</span>
      </div>
    )
  }

  // Transform data for Recharts
  const chartData = data.map((point) => ({
    timestamp: point.timestamp,
    profit: point.profit,
    date: formatDate(point.timestamp),
  }))

  // Calculate profit range
  const profits = data.map(d => d.profit)
  const minProfit = Math.min(...profits, 0)
  const maxProfit = Math.max(...profits, 0)
  const hasNegative = minProfit < 0 && maxProfit > 0

  // Determine line color based on final profit
  const finalProfit = profits[profits.length - 1]
  const lineColor = finalProfit >= 0 ? '#10b981' : '#ef4444'
  const gradientId = finalProfit >= 0 ? 'colorProfitPositive' : 'colorProfitNegative'

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const profit = payload[0].value
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 shadow-xl"
        >
          <div className="text-xs text-gray-400 mb-1">
            {payload[0].payload.date}
          </div>
          <div className={`text-lg font-bold font-mono ${
            profit >= 0 ? 'text-success' : 'text-danger'
          }`}>
            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
          </div>
        </motion.div>
      )
    }
    return null
  }

  // Custom Y-axis tick component with background to prevent overlap
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const value = payload.value
    const label = value >= 0 ? `+$${value.toFixed(0)}` : `-$${Math.abs(value).toFixed(0)}`

    return (
      <g transform={`translate(${x},${y})`}>
        <rect
          x={-80}
          y={-10}
          width={75}
          height={20}
          fill="#1a1d26"
          opacity={0.9}
        />
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
    // Show only a subset of labels to avoid crowding
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
          {formatDate(payload.value)}
        </text>
      </g>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-dark-700 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 15, right: 50, bottom: 35, left: 15 }}
          >
            <defs>
              <linearGradient id="colorProfitPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfitNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="0" stroke="#22262f" />

            <XAxis
              dataKey="timestamp"
              tick={<CustomXAxisTick />}
              stroke="#22262f"
              tickLine={false}
              interval={Math.floor(chartData.length / 6)} // Show ~6 labels
            />

            <YAxis
              tick={<CustomYAxisTick />}
              stroke="#22262f"
              tickLine={false}
              domain={[minProfit, maxProfit]}
              tickCount={6}
            />

            {hasNegative && (
              <ReferenceLine
                y={0}
                stroke="#4b5563"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            )}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'rgba(107, 114, 128, 0.3)',
                strokeWidth: 1,
              }}
              wrapperStyle={{ zIndex: 100 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />

            <Area
              type="monotone"
              dataKey="profit"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 4,
                fill: lineColor,
                stroke: '#1a1d26',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
