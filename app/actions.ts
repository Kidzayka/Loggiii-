// Без изменений
"use server"

import connectDB from "@/lib/db"
import Appointment from "@/models/Appointment"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { appointmentSchema, type AppointmentFormData } from "@/lib/validation"
import { ZodError } from "zod"

// Функция для экранирования специальных символов для MarkdownV2
const escapeMarkdownV2 = (text: string) => {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&")
}

export async function createAppointment(formData: AppointmentFormData) {
  try {
    // Серверная валидация данных
    const validatedData = appointmentSchema.parse(formData)

    await connectDB()

    const newAppointment = new Appointment({
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email || undefined, // Убедимся, что пустая строка становится undefined
      preferredDate: validatedData.preferredDate,
      preferredTime: validatedData.preferredTime,
      message: validatedData.message || undefined, // Убедимся, что пустая строка становится undefined
    })

    await newAppointment.save()

    // Отправка уведомления в Telegram
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn("Токен Telegram-бота или ID чата не установлены. Уведомление в Telegram пропущено.")
    } else {
      const formattedDate = format(validatedData.preferredDate, "dd.MM.yyyy", { locale: ru })
      const telegramMessage = `
        *Новая запись на прием к логопеду:*
        *Имя:* ${escapeMarkdownV2(validatedData.name)}
        *Телефон:* ${escapeMarkdownV2(validatedData.phone)}
        *Email:* ${escapeMarkdownV2(validatedData.email || "Не указан")}
        *Предпочитаемая дата:* ${escapeMarkdownV2(formattedDate)}
        *Предпочитаемое время:* ${escapeMarkdownV2(validatedData.preferredTime)}
        *Сообщение:* ${escapeMarkdownV2(validatedData.message || "Нет")}
      `
        .replace(/ {2,}/g, "")
        .trim() // Удаляем лишние пробелы и обрезаем

      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

      await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: "MarkdownV2",
        }),
      })
    }

    return { success: true, message: "Запись успешно создана!" }
  } catch (error) {
    if (error instanceof ZodError) {
      // Обработка ошибок валидации Zod
      const errors = error.flatten().fieldErrors
      const errorMessage = Object.values(errors).flat().join("; ")
      return { success: false, message: `Ошибка валидации: ${errorMessage}` }
    }
    console.error("Ошибка при создании записи:", error)
    return { success: false, message: "Ошибка при создании записи. Пожалуйста, попробуйте еще раз." }
  }
}
