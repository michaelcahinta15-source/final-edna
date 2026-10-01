"use client"

import { useState, useEffect } from "react"

interface SkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = "" }: SkeletonProps) {
  const [visible, setVisible] = useState<boolean>(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      aria-hidden="true"
    >
      {visible ? (
        <div className="h-4 w-full rounded"></div>
      ) : (
        <div className="h-4 w-3/4 rounded"></div>
      )}
    </div>
  )
}

export default LoadingSkeleton
