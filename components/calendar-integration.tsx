"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Smartphone, Globe, Clock, CheckCircle } from "lucide-react"
import { generateGoogleCalendarUrl, generateICSFile, isIOS } from "@/lib/utils"

interface CalendarIntegrationProps {
  appointmentData: {
    bookingCode: string
    name: string
    preferredDate: Date
    preferredTime: string
    message?: string
  }
}

export function CalendarIntegration({ appointmentData }: CalendarIntegrationProps) {
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")
  const [calendarAdded, setCalendarAdded] = useState(false)

  useEffect(() => {
    if (isIOS()) {
      setDeviceType("ios")
    } else if (/Android/i.test(navigator.userAgent)) {
      setDeviceType("android")
    } else {
      setDeviceType("desktop")
    }
  }, [])

  const startDate = new Date(appointmentData.preferredDate)
  const [hours, minutes] = appointmentData.preferredTime.split(":").map(Number)
  startDate.setHours(hours, minutes, 0, 0)

  const endDate = new Date(startDate)
  endDate.setHours(hours + 1, minutes, 0, 0)

  const title = "Консультация логопеда"
  const description = `Запись к логопеду
Код записи: ${appointmentData.bookingCode}
Имя: ${appointmentData.name}
${appointmentData.message ? `Дополнительная информация: ${appointmentData.message}` : ""}

Контакты для связи:
📞 Телефон: +7 (XXX) XXX-XX-XX
📧 Email: info@logoped.ru
🏢 Адрес: г. Москва, ул. Примерная, д. 1`
  const location = "Кабинет логопеда, г. Москва, ул. Примерная, д. 1"

  const addToiPhoneCalendar = async () => {
    try {
      const icsContent = generateICSFile(title, startDate, endDate, description, location)

      if (navigator.share && deviceType === "ios") {
        // Используем Web Share API для iOS
        const file = new File([icsContent], `logoped-${appointmentData.bookingCode}.ics`, {
          type: "text/calendar",
        })

        await navigator.share({
          title: "Добавить в календарь",
          text: "Консультация логопеда",
          files: [file],
        })
      } else {
        // Fallback: прямое скачивание файла
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `logoped-${appointmentData.bookingCode}.ics`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      setCalendarAdded(true)
      setTimeout(() => setCalendarAdded(false), 3000)
    } catch (error) {
      console.error("Error adding to iPhone calendar:", error)
      // Fallback к обычному скачиванию
      downloadICSFile()
    }
  }

  const addToGoogleCalendar = () => {
    const googleUrl = generateGoogleCalendarUrl(title, startDate, endDate, description, location)
    window.open(googleUrl, "_blank")
    setCalendarAdded(true)
    setTimeout(() => setCalendarAdded(false), 3000)
  }

  const downloadICSFile = () => {
    const icsContent = generateICSFile(title, startDate, endDate, description, location)
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `logoped-appointment-${appointmentData.bookingCode}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const addToOutlookCalendar = () => {
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`
    window.open(outlookUrl, "_blank")
    setCalendarAdded(true)
    setTimeout(() => setCalendarAdded(false), 3000)
  }

  return (
    <div className="bg-blue-50/80 backdrop-blur-xl rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-blue-900 font-semibold text-lg">Добавить в календарь</span>
      </div>

      {calendarAdded && (
        <div className="flex items-center justify-center mb-4 p-3 bg-green-100/80 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium text-sm">Событие добавлено в календарь!</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Основная кнопка в зависимости от устройства */}
        {deviceType === "ios" ? (
          <Button
            onClick={addToiPhoneCalendar}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Добавить в календарь iPhone
          </Button>
        ) : (
          <Button
            onClick={addToGoogleCalendar}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Globe className="w-4 h-4 mr-2" />
            Добавить в Google Calendar
          </Button>
        )}

        {/* Дополнительные опции */}
        <div className="grid grid-cols-3 gap-2">
          {deviceType !== "ios" && (
            <Button
              onClick={addToiPhoneCalendar}
              variant="outline"
              className="h-10 bg-white/70 border-0 hover:bg-white/90 text-gray-700 font-medium rounded-xl 
                       transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] text-xs"
            >
              <Smartphone className="w-3 h-3 mr-1" />
              iPhone
            </Button>
          )}

          {deviceType !== "desktop" && (
            <Button
              onClick={addToGoogleCalendar}
              variant="outline"
              className="h-10 bg-white/70 border-0 hover:bg-white/90 text-gray-700 font-medium rounded-xl 
                       transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] text-xs"
            >
              <Globe className="w-3 h-3 mr-1" />
              Google
            </Button>
          )}

          <Button
            onClick={addToOutlookCalendar}
            variant="outline"
            className="h-10 bg-white/70 border-0 hover:bg-white/90 text-gray-700 font-medium rounded-xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] text-xs"
          >
            Outlook
          </Button>

          <Button
            onClick={downloadICSFile}
            variant="outline"
            className="h-10 bg-white/70 border-0 hover:bg-white/90 text-gray-700 font-medium rounded-xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            .ics
          </Button>
        </div>
      </div>

      {/* Информация о напоминаниях */}
      <div className="mt-4 p-3 bg-white/50 rounded-xl">
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Автоматические напоминания:</p>
            <ul className="space-y-0.5 text-blue-700">
              <li>• За день до консультации</li>
              <li>• За час до консультации</li>
              <li>• За 15 минут до консультации</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Инструкция для iPhone */}
      {deviceType === "ios" && (
        <div className="mt-4 p-3 bg-orange-50/80 rounded-xl">
          <p className="text-xs text-orange-800 font-medium mb-1">💡 Для iPhone пользователей:</p>
          <p className="text-xs text-orange-700">
            После нажатия кнопки выберите "Календарь" в меню "Поделиться" или сохраните файл и откройте его в приложении
            "Календарь"
          </p>
        </div>
      )}
    </div>
  )
}
