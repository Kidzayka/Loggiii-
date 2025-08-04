import { z } from "zod"

export const appointmentSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Имя должно содержать не менее 2 символов." })
    .max(50, { message: "Имя должно содержать не более 50 символов." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Неверный формат номера телефона." }),
  email: z.string().email({ message: "Неверный формат email." }).optional().or(z.literal("")),
  preferredDate: z.date({ required_error: "Пожалуйста, выберите предпочитаемую дату." }),
  preferredTime: z.string().min(1, { message: "Пожалуйста, выберите предпочитаемое время." }),
  message: z
    .string()
    .max(500, { message: "Сообщение должно содержать не более 500 символов." })
    .optional()
    .or(z.literal("")),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>
