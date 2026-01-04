import { motion } from 'framer-motion'
import { formatCurrency, formatPercent } from '../../utils'

interface Stat {
  label: string
  value: string | number
  change?: number
  colorClass?: string
}

interface MarketStatsProps {
  stats: Stat[]
  actionButton?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function MarketStats({ stats, actionButton }: MarketStatsProps) {
  return (
    <div className="space-y-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex justify-between items-center"
        >
          <span className="text-sm text-gray-400">{stat.label}</span>
          <div className="text-right">
            <span
              className={`font-mono tabular-nums ${
                stat.colorClass || 'text-gray-100'
              }`}
            >
              {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
            </span>
            {stat.change !== undefined && (
              <div
                className={`text-xs font-mono tabular-nums ${
                  stat.change >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {formatPercent(stat.change)}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {actionButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: stats.length * 0.05 }}
          className="pt-3 border-t border-dark-600 dark:border-dark-600 light:border-gray-200"
        >
          {actionButton.href ? (
            <a
              href={actionButton.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full text-center block"
            >
              {actionButton.label}
            </a>
          ) : (
            <button onClick={actionButton.onClick} className="btn btn-primary w-full">
              {actionButton.label}
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
