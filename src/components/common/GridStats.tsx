import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils'

interface Stat {
  label: string
  value: string | number
  colorClass?: string
}

interface GridStatsProps {
  stats: Stat[]
  columns?: number
}

export function GridStats({ stats, columns = 3 }: GridStatsProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          className="bg-dark-700 dark:bg-dark-700 light:bg-gray-50 rounded-lg p-4 border border-dark-600 dark:border-dark-600 light:border-gray-200"
        >
          <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
          <div className={`text-lg font-semibold font-mono tabular-nums ${
            stat.colorClass || 'text-gray-100'
          }`}>
            {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
