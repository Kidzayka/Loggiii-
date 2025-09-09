import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Генерация 5-буквенного кода
export function generateBookingCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Генерация ссылки для календаря Google
export function generateGoogleCalendarUrl(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string,
): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description || "",
    location: location || "",
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Генерация файла .ics для календаря
export function generateICSFile(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string,
): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@logoped.app`

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Логопед//Запись на консультацию//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Консультация логопеда",
    "X-WR-TIMEZONE:Europe/Moscow",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Moscow",
    "BEGIN:STANDARD",
    "DTSTART:20231029T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "TZNAME:MSK",
    "TZOFFSETFROM:+0400",
    "TZOFFSETTO:+0300",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:20240331T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "TZNAME:MSD",
    "TZOFFSETFROM:+0300",
    "TZOFFSETTO:+0400",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;TZID=Europe/Moscow:${formatDate(startDate).slice(0, -1)}`,
    `DTEND;TZID=Europe/Moscow:${formatDate(endDate).slice(0, -1)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || ""}`,
    `LOCATION:${location || ""}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "SEQUENCE:0",
    "CLASS:PUBLIC",
    // Напоминания для iPhone
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Напоминание: консультация логопеда через 15 минут",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Напоминание: консультация логопеда через 1 час",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Напоминание: завтра консультация логопеда",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  return icsContent
}

// Генерация ссылки для iPhone календаря (webcal протокол)
export function generateiPhoneCalendarUrl(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string,
): string {
  const icsContent = generateICSFile(title, startDate, endDate, description, location)
  const blob = new Blob([icsContent], { type: "text/calendar" })
  const url = URL.createObjectURL(blob)

  // Для iPhone используем webcal протокол
  return url.replace("blob:", "webcal://")
}

// Определение устройства пользователя
export function getDeviceInfo() {
  if (typeof window === "undefined") {
    return { type: "unknown", os: "unknown", browser: "unknown" }
  }

  const userAgent = navigator.userAgent
  const platform = navigator.platform

  // Определение операционной системы
  let os = "unknown"
  if (/iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    os = "ios"
  } else if (/Android/i.test(userAgent)) {
    os = "android"
  } else if (/Mac/i.test(platform)) {
    os = "macos"
  } else if (/Win/i.test(platform)) {
    os = "windows"
  } else if (/Linux/i.test(platform)) {
    os = "linux"
  }

  // Определение типа устройства
  let type = "desktop"
  if (/Mobi|Android/i.test(userAgent)) {
    type = "mobile"
  } else if (/Tablet|iPad/i.test(userAgent)) {
    type = "tablet"
  }

  // Определение браузера
  let browser = "unknown"
  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
    browser = "chrome"
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = "safari"
  } else if (/Firefox/i.test(userAgent)) {
    browser = "firefox"
  } else if (/Edge/i.test(userAgent)) {
    browser = "edge"
  }

  return { type, os, browser }
}

// Получение рекомендуемых календарных сервисов
export function getRecommendedCalendarServices(deviceInfo: ReturnType<typeof getDeviceInfo>) {
  const services = []

  // Основные рекомендации по устройству
  if (deviceInfo.os === "ios") {
    services.push({
      id: "apple",
      name: "Календарь iPhone",
      icon: "smartphone",
      primary: true,
      description: "Добавить в стандартный календарь iPhone",
      method: "native_ios",
    })
    services.push({
      id: "google",
      name: "Google Calendar",
      icon: "globe",
      primary: false,
      description: "Открыть в Google Calendar",
      method: "web_link",
    })
  } else if (deviceInfo.os === "android") {
    services.push({
      id: "google",
      name: "Google Calendar",
      icon: "globe",
      primary: true,
      description: "Добавить в Google Calendar",
      method: "web_link",
    })
    services.push({
      id: "android_calendar",
      name: "Календарь Android",
      icon: "smartphone",
      primary: false,
      description: "Скачать файл календаря",
      method: "download_ics",
    })
  } else if (deviceInfo.os === "windows") {
    services.push({
      id: "outlook",
      name: "Outlook Calendar",
      icon: "mail",
      primary: true,
      description: "Открыть в Outlook",
      method: "web_link",
    })
    services.push({
      id: "google",
      name: "Google Calendar",
      icon: "globe",
      primary: false,
      description: "Открыть в Google Calendar",
      method: "web_link",
    })
  } else if (deviceInfo.os === "macos") {
    services.push({
      id: "apple",
      name: "Календарь Mac",
      icon: "calendar",
      primary: true,
      description: "Добавить в календарь Mac",
      method: "download_ics",
    })
    services.push({
      id: "google",
      name: "Google Calendar",
      icon: "globe",
      primary: false,
      description: "Открыть в Google Calendar",
      method: "web_link",
    })
  } else {
    // Универсальные варианты
    services.push({
      id: "google",
      name: "Google Calendar",
      icon: "globe",
      primary: true,
      description: "Открыть в Google Calendar",
      method: "web_link",
    })
  }

  // Всегда добавляем универсальные опции
  services.push({
    id: "ics",
    name: "Скачать файл",
    icon: "download",
    primary: false,
    description: "Скачать .ics файл для любого календаря",
    method: "download_ics",
  })

  return services
}

// Генерация ссылки для Outlook Calendar
export function generateOutlookCalendarUrl(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string,
): string {
  const params = new URLSearchParams({
    subject: title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: description || "",
    location: location || "",
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

// Генерация Android Calendar Intent
export function generateAndroidCalendarIntent(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string,
): string {
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  const params = new URLSearchParams({
    action: "android.intent.action.INSERT",
    type: "vnd.android.cursor.item/event",
    title: title,
    beginTime: startTime.toString(),
    endTime: endTime.toString(),
    description: description || "",
    eventLocation: location || "",
  })

  return `intent://calendar/events?${params.toString()}#Intent;scheme=content;package=com.android.calendar;end`
}

// Генерация ссылки для календаря Apple
export function generateAppleCalendarUrl(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string,
): string {
  // Для iOS используем data URL с .ics содержимым
  const icsContent = generateICSFile(title, startDate, endDate, description, location)
  const encodedIcs = encodeURIComponent(icsContent)

  return `data:text/calendar;charset=utf8,${encodedIcs}`
}

export function isIOS(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}
