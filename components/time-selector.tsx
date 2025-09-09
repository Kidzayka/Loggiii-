"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  availableSlots: string[]
  isLoading?: boolean
}

export function TimeSelector({ value, onValueChange, availableSlots, isLoading = false }: TimeSelectorProps) {
  const allTimeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isLoading || availableSlots.length === 0}>
      <SelectTrigger
        className={cn(
          "bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl h-12 text-base font-medium px-4",
          "focus:bg-white/90 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg",
          "transition-all duration-150 ease-out",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="flex items-center w-full">
          <Clock className="mr-3 h-5 w-5 text-teal-500" />
          <SelectValue
            placeholder={
              isLoading ? "Загрузка..." : availableSlots.length === 0 ? "Нет доступного времени" : "Выберите время"
            }
          />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white/95 backdrop-blur-2xl border-0 rounded-3xl shadow-2xl max-h-60 p-2">
        <div className="space-y-1">
          {allTimeSlots.map((time) => {
            const isAvailable = availableSlots.includes(time)
            return (
              <SelectItem
                key={time}
                value={time}
                disabled={!isAvailable}
                className={cn(
                  "rounded-2xl transition-all duration-150 text-base font-medium py-3 px-4 cursor-pointer",
                  isAvailable
                    ? "hover:bg-blue-50 focus:bg-blue-100 text-gray-900"
                    : "text-gray-300 cursor-not-allowed opacity-50 hover:bg-transparent",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{time}</span>
                  {!isAvailable && <span className="text-xs text-red-400 ml-2">Занято</span>}
                </div>
              </SelectItem>
            )
          })}
        </div>
        {availableSlots.length === 0 && !isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>На выбранную дату нет</p>
            <p>свободного времени</p>
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
