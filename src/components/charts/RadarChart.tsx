import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'

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

export function RadarChart({ data, title, height = 300, color = '#10b981' }: RadarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-dark-700 rounded-lg"
        style={{ height }}
      >
        <span className="text-gray-500">暂无数据</span>
      </div>
    )
  }

  // Transform data for Recharts Radar
  const chartData = data.map((point) => ({
    subject: point.label,
    value: point.value,
    fullMark: 100,
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 shadow-xl"
        >
          <div className="text-sm text-gray-300 mb-1">
            {data.subject}
          </div>
          <div className="text-lg font-bold text-success font-mono">
            {data.value.toFixed(0)}%
          </div>
        </motion.div>
      )
    }
    return null
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
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar data={chartData}>
            <PolarGrid
              stroke="#22262f"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: '#9ca3af',
                fontSize: 12,
              }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: '#6b7280',
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
            />
            <Radar
              name="Value"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 100 }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
