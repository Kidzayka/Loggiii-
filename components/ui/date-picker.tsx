"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { ru } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  disabledDates?: Date[]
}

export function DatePicker({ date, setDate, placeholder = "Выберите дату", disabledDates = [] }: DatePickerProps) {
  const isDateDisabled = (date: Date) => {
    // Отключаем прошедшие даты
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true

    // Отключаем даты более чем через 6 месяцев
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6)
    if (date > maxDate) return true

    // Отключаем выходные (суббота = 6, воскресенье = 0)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return true

    // Отключаем полностью занятые дни
    return disabledDates.some(
      (disabledDate) =>
        disabledDate.getDate() === date.getDate() &&
        disabledDate.getMonth() === date.getMonth() &&
        disabledDate.getFullYear() === date.getFullYear(),
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-gray-400",
            "bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl shadow-sm",
            "hover:bg-gray-100/80 hover:shadow-md active:scale-[0.98]",
            "transition-all duration-150 ease-out",
            "focus:ring-2 focus:ring-blue-500/30 focus:bg-white/90",
            "h-11 sm:h-12 text-base font-medium px-4",
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5 text-blue-500" />
          <span className="truncate">{date ? format(date, "d MMMM yyyy", { locale: ru }) : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white/95 backdrop-blur-2xl border-0 rounded-3xl shadow-2xl"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={isDateDisabled}
          initialFocus
          locale={ru}
          className="rounded-3xl p-4"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-lg font-semibold text-gray-900",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-gray-100 rounded-full p-0 hover:bg-gray-200 transition-colors duration-150",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-xl w-10 font-medium text-sm",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-10 w-10 p-0 font-medium rounded-xl hover:bg-blue-50 transition-colors duration-150",
            day_selected: "bg-blue-500 text-white hover:bg-blue-600 shadow-lg",
            day_today: "bg-gray-100 text-gray-900 font-semibold",
            day_outside: "text-gray-300",
            day_disabled: "text-gray-200 opacity-50 cursor-not-allowed hover:bg-transparent",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
