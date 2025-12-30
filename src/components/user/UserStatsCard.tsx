import { motion } from 'framer-motion'

interface StatItem {
  label: string
  value: string | number
  colorClass?: string
  subtitle?: string
}

interface UserStatsCardProps {
  title: string
  stats: StatItem[]
  icon?: string
  avatar?: string
  showAvatar?: boolean
}

export function UserStatsCard({ title, stats, icon, avatar, showAvatar }: UserStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        {showAvatar && avatar && (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-lg font-bold flex-shrink-0">
            {avatar}
          </div>
        )}
        {!showAvatar && icon && <span className="text-2xl">{icon}</span>}
        <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0"
          >
            <div>
              <div className="text-sm text-gray-400">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</div>
              )}
            </div>
            <div className={`text-lg font-semibold ${stat.colorClass || 'text-gray-100'}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
