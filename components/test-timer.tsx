"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TestTimerProps {
  timeLimit: number
  onTimeUpdate?: (secondsElapsed: number) => void
}

export function TestTimer({ timeLimit, onTimeUpdate }: TestTimerProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => {
          const newValue = prev + 1
          if (onTimeUpdate) {
            onTimeUpdate(newValue)
          }
          return newValue
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, onTimeUpdate])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getTimeRemaining = () => {
    const totalLimitSeconds = timeLimit * 60
    const remaining = totalLimitSeconds - secondsElapsed
    return remaining > 0 ? remaining : 0
  }

  const getTimerColor = () => {
    const remaining = getTimeRemaining()
    const totalLimitSeconds = timeLimit * 60
    const percentRemaining = (remaining / totalLimitSeconds) * 100

    if (percentRemaining <= 10) return "text-red-500"
    if (percentRemaining <= 25) return "text-amber-500"
    return "text-green-500"
  }

  return (
    <div className={`flex items-center gap-1 font-mono text-lg ${getTimerColor()}`}>
      <Clock className="h-4 w-4" />
      <span>{formatTime(getTimeRemaining())}</span>
    </div>
  )
}
