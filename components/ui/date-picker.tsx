"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import ru from "date-fns/locale/ru"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = "Выберите дату" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal transition-all duration-300 ease-in-out", // Добавлен ease-in-out
            !date && "text-muted-foreground",
            "bg-white/50 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/70",
            "hover:bg-white/70 dark:hover:bg-gray-800/70 hover:scale-[1.01] hover:shadow-md", // Анимация при наведении
            "active:scale-[0.99] active:shadow-sm", // Анимация при нажатии
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ru }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={ru}
          className="[&_td]:rounded-md [&_td]:transition-colors [&_td]:duration-200 [&_td]:ease-in-out [&_td]:hover:bg-blue-100/50 dark:[&_td]:hover:bg-blue-900/50" // Анимация для ячеек календаря
        />
      </PopoverContent>
    </Popover>
  )
}
