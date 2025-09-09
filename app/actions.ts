"use server"

import connectDB from "@/lib/db"
import Appointment from "@/models/Appointment"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { appointmentSchema, validateAppointmentSlot, type AppointmentFormData } from "@/lib/validation"
import { generateBookingCode } from "@/lib/utils"
import { ZodError } from "zod"

const escapeMarkdownV2 = (text: string): string => {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

// Все доступные временные слоты
const ALL_TIME_SLOTS = [
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

export async function createAppointment(formData: AppointmentFormData) {
  try {
    console.log("🚀 Starting appointment creation process...")

    // 1. Валидация данных
    const validatedData = appointmentSchema.parse(formData)
    console.log("✅ Data validation successful")

    // 2. Дополнительная валидация времени
    const appointmentDateTime = validateAppointmentSlot(validatedData.preferredDate, validatedData.preferredTime)

    // 3. Подключение к базе данных
    await connectDB()
    console.log("✅ Database connection established")

    // 4. Генерация уникального кода записи
    let bookingCode: string
    let isCodeUnique = false
    let attempts = 0
    const maxAttempts = 10

    do {
      bookingCode = generateBookingCode()
      const existingCode = await Appointment.findOne({ bookingCode })
      isCodeUnique = !existingCode
      attempts++
    } while (!isCodeUnique && attempts < maxAttempts)

    if (!isCodeUnique) {
      throw new Error("Не удалось сгенерировать уникальный код записи")
    }

    // 5. Проверка на дубликаты времени
    const startOfDay = new Date(validatedData.preferredDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(validatedData.preferredDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointment = await Appointment.findOne({
      preferredDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      preferredTime: validatedData.preferredTime,
      status: "active", // Только активные записи
    })

    if (existingAppointment) {
      console.log("⚠️ Time slot already taken")
      return {
        success: false,
        message: "К сожалению, это время уже занято. Пожалуйста, выберите другое время.",
      }
    }

    // 6. Создание записи
    const newAppointment = new Appointment({
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      preferredDate: validatedData.preferredDate,
      preferredTime: validatedData.preferredTime,
      message: validatedData.message,
      bookingCode: bookingCode!,
      status: "active",
    })

    const savedAppointment = await newAppointment.save()
    console.log("✅ Appointment saved to database:", savedAppointment._id)

    // 7. Отправка уведомления в Telegram
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const formattedDate = format(validatedData.preferredDate, "d MMMM yyyy", { locale: ru })
        const telegramMessage = `🎯 *Новая запись к логопеду*

👤 *Имя:* ${escapeMarkdownV2(validatedData.name)}
📞 *Телефон:* ${escapeMarkdownV2(validatedData.phone)}
📧 *Email:* ${escapeMarkdownV2(validatedData.email || "Не указан")}
📅 *Дата:* ${escapeMarkdownV2(formattedDate)}
⏰ *Время:* ${escapeMarkdownV2(validatedData.preferredTime)}
💬 *Сообщение:* ${escapeMarkdownV2(validatedData.message || "Нет дополнительной информации")}

🔑 *Код записи:* \`${escapeMarkdownV2(bookingCode!)}\`
🆔 *ID записи:* ${escapeMarkdownV2(savedAppointment._id.toString())}`

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: "MarkdownV2",
          }),
        })

        if (response.ok) {
          console.log("✅ Telegram notification sent successfully")
        } else {
          console.warn("⚠️ Telegram notification failed:", await response.text())
        }
      } catch (telegramError) {
        console.error("❌ Telegram notification error:", telegramError)
      }
    } else {
      console.warn("⚠️ Telegram credentials not configured")
    }

    return {
      success: true,
      message: "Запись успешно создана! Мы свяжемся с вами в ближайшее время.",
      appointmentId: savedAppointment._id.toString(),
      bookingCode: bookingCode!,
    }
  } catch (error) {
    console.error("❌ Error creating appointment:", error)

    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors
      const errorMessage = Object.values(errors).flat().join("; ")
      return { success: false, message: `Ошибка валидации: ${errorMessage}` }
    }

    if (error instanceof Error) {
      return { success: false, message: error.message }
    }

    return {
      success: false,
      message: "Произошла неожиданная ошибка. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.",
    }
  }
}

// Получение записи по коду
export async function getAppointmentByCode(bookingCode: string) {
  try {
    await connectDB()

    const appointment = await Appointment.findOne({
      bookingCode: bookingCode.toUpperCase(),
    }).select("name preferredDate preferredTime bookingCode status")

    if (!appointment) {
      return {
        success: false,
        message: "Запись с таким кодом не найдена",
        appointment: null,
      }
    }

    return {
      success: true,
      appointment: {
        _id: appointment._id.toString(),
        name: appointment.name,
        preferredDate: appointment.preferredDate.toISOString(),
        preferredTime: appointment.preferredTime,
        bookingCode: appointment.bookingCode,
        status: appointment.status,
      },
    }
  } catch (error) {
    console.error("Error fetching appointment by code:", error)
    return {
      success: false,
      message: "Произошла ошибка при поиске записи",
      appointment: null,
    }
  }
}

// Отмена записи
export async function cancelAppointment(bookingCode: string) {
  try {
    await connectDB()

    const appointment = await Appointment.findOne({
      bookingCode: bookingCode.toUpperCase(),
      status: "active",
    })

    if (!appointment) {
      return {
        success: false,
        message: "Активная запись с таким кодом не найдена",
      }
    }

    // Проверяем, что запись не в прошлом
    const appointmentDateTime = new Date(appointment.preferredDate)
    const [hours, minutes] = appointment.preferredTime.split(":").map(Number)
    appointmentDateTime.setHours(hours, minutes, 0, 0)

    if (appointmentDateTime <= new Date()) {
      return {
        success: false,
        message: "Нельзя отменить запись, которая уже прошла",
      }
    }

    // Отменяем запись
    appointment.status = "cancelled"
    appointment.cancelledAt = new Date()
    await appointment.save()

    // Отправляем уведомление в Telegram об отмене
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const formattedDate = format(appointment.preferredDate, "d MMMM yyyy", { locale: ru })
        const telegramMessage = `❌ *Отмена записи*

👤 *Имя:* ${escapeMarkdownV2(appointment.name)}
📞 *Телефон:* ${escapeMarkdownV2(appointment.phone)}
📅 *Дата:* ${escapeMarkdownV2(formattedDate)}
⏰ *Время:* ${escapeMarkdownV2(appointment.preferredTime)}
🔑 *Код записи:* \`${escapeMarkdownV2(appointment.bookingCode)}\`

⏰ *Время теперь свободно для других клиентов*`

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: "MarkdownV2",
          }),
        })
      } catch (telegramError) {
        console.error("❌ Telegram cancellation notification error:", telegramError)
      }
    }

    console.log("✅ Appointment cancelled:", appointment.bookingCode)

    return {
      success: true,
      message: "Запись успешно отменена",
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return {
      success: false,
      message: "Произошла ошибка при отмене записи",
    }
  }
}

// Получение доступных слотов для конкретной даты (обновлено для учета отмененных записей)
export async function getAvailableSlots(date: Date) {
  try {
    await connectDB()

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Получаем только активные записи на эту дату
    const bookedAppointments = await Appointment.find({
      preferredDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "active", // Только активные записи
    }).select("preferredTime")

    const bookedSlots = bookedAppointments.map((apt) => apt.preferredTime)

    // Фильтруем доступные слоты
    const availableSlots = ALL_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot))

    // Дополнительная проверка для прошедшего времени в текущем дне
    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()

    let filteredSlots = availableSlots
    if (isToday) {
      const currentTime = now.getHours() * 60 + now.getMinutes()
      filteredSlots = availableSlots.filter((slot) => {
        const [hours, minutes] = slot.split(":").map(Number)
        const slotTime = hours * 60 + minutes
        return slotTime > currentTime + 30 // Минимум 30 минут до записи
      })
    }

    return {
      success: true,
      availableSlots: filteredSlots,
      totalSlots: ALL_TIME_SLOTS.length,
      bookedSlots: bookedSlots.length,
    }
  } catch (error) {
    console.error("Error fetching available slots:", error)
    return {
      success: false,
      availableSlots: [],
      totalSlots: ALL_TIME_SLOTS.length,
      bookedSlots: 0,
    }
  }
}

// Получение полностью занятых дат (обновлено для учета отмененных записей)
export async function getFullyBookedDates() {
  try {
    await connectDB()

    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)

    // Агрегируем только активные записи по датам
    const bookingsByDate = await Appointment.aggregate([
      {
        $match: {
          preferredDate: {
            $gte: today,
            $lte: sixMonthsLater,
          },
          status: "active", // Только активные записи
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$preferredDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: ALL_TIME_SLOTS.length }, // Полностью занятые дни
        },
      },
    ])

    const fullyBookedDates = bookingsByDate.map((item) => item._id)

    return {
      success: true,
      dates: fullyBookedDates,
    }
  } catch (error) {
    console.error("Error fetching fully booked dates:", error)
    return {
      success: false,
      dates: [],
    }
  }
}

// Получение статистики записей
export async function getBookingStats() {
  try {
    await connectDB()

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const stats = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          activeAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          uniqueClients: { $addToSet: "$phone" },
        },
      },
      {
        $project: {
          totalAppointments: 1,
          activeAppointments: 1,
          cancelledAppointments: 1,
          uniqueClients: { $size: "$uniqueClients" },
        },
      },
    ])

    return {
      success: true,
      stats: stats[0] || {
        totalAppointments: 0,
        activeAppointments: 0,
        cancelledAppointments: 0,
        uniqueClients: 0,
      },
    }
  } catch (error) {
    console.error("Error fetching booking stats:", error)
    return {
      success: false,
      stats: {
        totalAppointments: 0,
        activeAppointments: 0,
        cancelledAppointments: 0,
        uniqueClients: 0,
      },
    }
  }
}
