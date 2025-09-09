"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Download,
  Smartphone,
  Globe,
  Clock,
  CheckCircle,
  Mail,
  Monitor,
  Tablet,
  Info,
  Star,
} from "lucide-react"
import {
  generateGoogleCalendarUrl,
  generateICSFile,
  generateOutlookCalendarUrl,
  generateAndroidCalendarIntent,
  getDeviceInfo,
  getRecommendedCalendarServices,
} from "@/lib/utils"

interface SmartCalendarIntegrationProps {
  appointmentData: {
    bookingCode: string
    name: string
    preferredDate: Date
    preferredTime: string
    message?: string
  }
}

export function SmartCalendarIntegration({ appointmentData }: SmartCalendarIntegrationProps) {
  const [deviceInfo, setDeviceInfo] = useState({ type: "unknown", os: "unknown", browser: "unknown" })
  const [recommendedServices, setRecommendedServices] = useState<any[]>([])
  const [calendarAdded, setCalendarAdded] = useState(false)
  const [showAllOptions, setShowAllOptions] = useState(false)

  useEffect(() => {
    const info = getDeviceInfo()
    setDeviceInfo(info)
    setRecommendedServices(getRecommendedCalendarServices(info))
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

  const handleCalendarAction = async (service: any) => {
    try {
      switch (service.method) {
        case "native_ios":
          await addToiPhoneCalendar()
          break
        case "web_link":
          if (service.id === "google") {
            addToGoogleCalendar()
          } else if (service.id === "outlook") {
            addToOutlookCalendar()
          }
          break
        case "download_ics":
          downloadICSFile()
          break
        case "android_intent":
          addToAndroidCalendar()
          break
        default:
          downloadICSFile()
      }

      setCalendarAdded(true)
      setTimeout(() => setCalendarAdded(false), 3000)
    } catch (error) {
      console.error("Error adding to calendar:", error)
    }
  }

  const addToiPhoneCalendar = async () => {
    const icsContent = generateICSFile(title, startDate, endDate, description, location)

    if (navigator.share && deviceInfo.os === "ios") {
      const file = new File([icsContent], `logoped-${appointmentData.bookingCode}.ics`, {
        type: "text/calendar",
      })

      await navigator.share({
        title: "Добавить в календарь",
        text: "Консультация логопеда",
        files: [file],
      })
    } else {
      downloadICSFile()
    }
  }

  const addToGoogleCalendar = () => {
    const googleUrl = generateGoogleCalendarUrl(title, startDate, endDate, description, location)
    window.open(googleUrl, "_blank")
  }

  const addToOutlookCalendar = () => {
    const outlookUrl = generateOutlookCalendarUrl(title, startDate, endDate, description, location)
    window.open(outlookUrl, "_blank")
  }

  const addToAndroidCalendar = () => {
    const androidIntent = generateAndroidCalendarIntent(title, startDate, endDate, description, location)
    window.location.href = androidIntent
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

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "smartphone":
        return <Smartphone className="w-4 h-4" />
      case "globe":
        return <Globe className="w-4 h-4" />
      case "mail":
        return <Mail className="w-4 h-4" />
      case "calendar":
        return <Calendar className="w-4 h-4" />
      case "download":
        return <Download className="w-4 h-4" />
      case "monitor":
        return <Monitor className="w-4 h-4" />
      case "tablet":
        return <Tablet className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getDeviceDisplayName = () => {
    if (deviceInfo.os === "ios") {
      return deviceInfo.type === "tablet" ? "iPad" : "iPhone"
    } else if (deviceInfo.os === "android") {
      return "Android"
    } else if (deviceInfo.os === "macos") {
      return "Mac"
    } else if (deviceInfo.os === "windows") {
      return "Windows"
    }
    return "вашего устройства"
  }

  const primaryService = recommendedServices.find((s) => s.primary)
  const secondaryServices = recommendedServices.filter((s) => !s.primary)

  return (
    <div className="bg-blue-50/80 backdrop-blur-xl rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-blue-900 font-semibold text-lg">Добавить в календарь</span>
      </div>

      {/* Информация об устройстве */}
      <div className="flex items-center justify-center mb-4 p-3 bg-white/50 rounded-xl">
        <Info className="w-4 h-4 text-blue-600 mr-2" />
        <span className="text-blue-800 text-sm font-medium">Рекомендовано для {getDeviceDisplayName()}</span>
      </div>

      {calendarAdded && (
        <div className="flex items-center justify-center mb-4 p-3 bg-green-100/80 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium text-sm">Событие добавлено в календарь!</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Основная рекомендуемая кнопка */}
        {primaryService && (
          <Button
            onClick={() => handleCalendarAction(primaryService)}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-lg relative"
          >
            <div className="flex items-center justify-center">
              {getServiceIcon(primaryService.icon)}
              <span className="ml-2">{primaryService.name}</span>
              <div className="absolute top-2 right-2">
                <Star className="w-3 h-3 text-yellow-300" />
              </div>
            </div>
            <div className="text-xs text-blue-100 mt-1">{primaryService.description}</div>
          </Button>
        )}

        {/* Дополнительные опции */}
        {!showAllOptions && secondaryServices.length > 0 && (
          <Button
            onClick={() => setShowAllOptions(true)}
            variant="outline"
            className="w-full h-10 bg-white/70 border-0 hover:bg-white/90 text-gray-700 font-medium rounded-xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] text-sm"
          >
            Показать другие варианты ({secondaryServices.length})
          </Button>
        )}

        {/* Все дополнительные сервисы */}
        {showAllOptions && (
          <div className="space-y-2">
            <div className="text-center text-gray-600 text-sm font-medium mb-3">Другие варианты:</div>
            <div className="grid grid-cols-1 gap-2">
              {secondaryServices.map((service) => (
                <Button
                  key={service.id}
                  onClick={() => handleCalendarAction(service)}
                  variant="outline"
                  className="h-12 bg-white/70 border-0 hover:bg-white/90 text-gray-700 font-medium rounded-xl 
                           transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] text-sm
                           flex items-center justify-start px-4"
                >
                  <div className="flex items-center">
                    {getServiceIcon(service.icon)}
                    <div className="ml-3 text-left">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setShowAllOptions(false)}
              variant="ghost"
              className="w-full h-8 text-gray-500 text-xs hover:bg-white/50 rounded-xl"
            >
              Скрыть дополнительные варианты
            </Button>
          </div>
        )}
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

      {/* Специальные инструкции по устройству */}
      {deviceInfo.os === "ios" && (
        <div className="mt-4 p-3 bg-orange-50/80 rounded-xl">
          <p className="text-xs text-orange-800 font-medium mb-1">💡 Для пользователей iPhone/iPad:</p>
          <p className="text-xs text-orange-700">
            После нажатия кнопки выберите "Календарь" в меню "Поделиться" или сохраните файл и откройте его в приложении
            "Календарь"
          </p>
        </div>
      )}

      {deviceInfo.os === "android" && (
        <div className="mt-4 p-3 bg-green-50/80 rounded-xl">
          <p className="text-xs text-green-800 font-medium mb-1">🤖 Для пользователей Android:</p>
          <p className="text-xs text-green-700">
            Google Calendar автоматически синхронизируется с вашим устройством. Также можете скачать .ics файл для
            других календарных приложений
          </p>
        </div>
      )}

      {deviceInfo.os === "windows" && (
        <div className="mt-4 p-3 bg-blue-50/80 rounded-xl">
          <p className="text-xs text-blue-800 font-medium mb-1">🪟 Для пользователей Windows:</p>
          <p className="text-xs text-blue-700">
            Outlook Calendar интегрируется с Windows. Скачанный .ics файл откроется в стандартном календарном приложении
          </p>
        </div>
      )}

      {deviceInfo.os === "macos" && (
        <div className="mt-4 p-3 bg-gray-50/80 rounded-xl">
          <p className="text-xs text-gray-800 font-medium mb-1">🍎 Для пользователей Mac:</p>
          <p className="text-xs text-gray-700">
            .ics файл автоматически откроется в приложении "Календарь" и синхронизируется с iCloud
          </p>
        </div>
      )}
    </div>
  )
}
