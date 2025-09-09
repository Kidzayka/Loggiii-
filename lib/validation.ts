import { z } from "zod"

export const appointmentSchema = z.object({
  name: z
    .string({ required_error: "Имя обязательно для заполнения" })
    .min(2, { message: "Имя должно содержать не менее 2 символов" })
    .max(50, { message: "Имя должно содержать не более 50 символов" })
    .trim()
    .refine((val) => val.length > 0, { message: "Имя не может быть пустым" }),

  phone: z
    .string({ required_error: "Телефон обязателен для заполнения" })
    .min(10, { message: "Введите корректный номер телефона" })
    .max(16, { message: "Номер телефона слишком длинный" })
    .regex(/^[+]?[1-9][\d\s\-()]{9,15}$/, { message: "Неверный формат номера телефона" })
    .transform((val) => val.replace(/[\s\-()]/g, "")),

  email: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      },
      { message: "Неверный формат email" },
    )
    .transform((val) => (val === "" ? undefined : val?.toLowerCase())),

  preferredDate: z
    .date({ required_error: "Выберите дату" })
    .refine((date) => date > new Date(), { message: "Дата должна быть в будущем" })
    .refine(
      (date) => {
        const today = new Date()
        const maxDate = new Date()
        maxDate.setMonth(today.getMonth() + 6)
        return date <= maxDate
      },
      { message: "Дата не может быть более чем через 6 месяцев" },
    ),

  preferredTime: z
    .string({ required_error: "Выберите время" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Неверный формат времени" })
    .refine(
      (time) => {
        const [hours, minutes] = time.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes
        return totalMinutes >= 9 * 60 && totalMinutes <= 18 * 60
      },
      { message: "Время должно быть между 9:00 и 18:00" },
    ),

  message: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, { message: "Сообщение должно содержать не более 500 символов" })
    .transform((val) => (val === "" ? undefined : val?.trim())),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const validateAppointmentSlot = (date: Date, time: string) => {
  const appointmentDateTime = new Date(date)
  const [hours, minutes] = time.split(":").map(Number)
  appointmentDateTime.setHours(hours, minutes, 0, 0)

  if (appointmentDateTime <= new Date()) {
    throw new Error("Нельзя записаться на прошедшее время")
  }

  return appointmentDateTime
}
