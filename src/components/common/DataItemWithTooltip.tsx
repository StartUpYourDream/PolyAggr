import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface DataItemWithTooltipProps {
  label: string
  value: string | React.ReactNode
  tooltip: string
  colorClass?: string
  className?: string
}

export function DataItemWithTooltip({
  label,
  value,
  tooltip,
  colorClass = 'text-gray-100',
  className = '',
}: DataItemWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className={`flex flex-col items-center justify-center p-2 bg-dark-700 dark:bg-dark-700 light:bg-gray-100 rounded border border-dark-600 dark:border-dark-600 light:border-gray-200 ${className}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
        <div className="relative flex items-center">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-help flex-shrink-0"
          >
            <span className="text-[10px] font-bold leading-none">?</span>
          </button>
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 min-w-[160px] max-w-[280px] px-3 py-2 bg-dark-900 dark:bg-dark-900 light:bg-white border border-dark-600 dark:border-dark-600 light:border-gray-300 rounded-lg shadow-xl pointer-events-none"
              >
                <div className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-700 leading-relaxed whitespace-normal">
                  {tooltip}
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-dark-900 dark:border-t-dark-900 light:border-t-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span className={`text-sm font-mono font-semibold ${colorClass}`}>
        {value}
      </span>
    </div>
  )
}
