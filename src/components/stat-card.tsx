"use client"

import type { FC, ReactNode } from "react"

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  bgColor: string
  textColor?: string
  trendValue?: number
  trendLabel?: string
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  textColor = "text-gray-900 dark:text-gray-100",
  trendValue,
  trendLabel
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${textColor}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${textColor}`}>
              {value.toLocaleString()}
            </p>
            {trendValue !== undefined && trendLabel && (
              <p className={`text-xs ${trendValue >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} ${textColor}`}>
                {trendValue}% {trendLabel}
              </p>
            )}
          </div>
          <div className={`h-10 w-10 ${bgColor} rounded flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Live overview</p>
      </div>
    </div>
  )
}

export default StatCard
