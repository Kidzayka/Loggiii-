"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { createAppointment } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentSchema, type AppointmentFormData } from "@/lib/validation"

export default function SpeechTherapistBookingForm() {
  const { toast } = useToast()

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      preferredDate: undefined,
      preferredTime: "",
      message: "",
    },
  })

  const timeSlots = [
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

  const onSubmit = async (data: AppointmentFormData) => {
    form.clearErrors()

    const result = await createAppointment(data)

    if (result.success) {
      toast({
        title: "Успех!",
        description: result.message,
      })
      form.reset()
    } else {
      toast({
        title: "Ошибка",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <Card
        className="w-full max-w-md bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl
                   transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.005]" // Анимация при наведении на карточку
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Запись на занятие к логопеду
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300">
            Пожалуйста, заполните форму, чтобы записаться на консультацию.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-800 dark:text-gray-200">
                Имя <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ваше имя"
                {...form.register("name")}
                className="bg-white/50 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/70
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                           transition-all duration-300 ease-in-out" // Улучшенный фокус
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-gray-800 dark:text-gray-200">
                Телефон <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (XXX) XXX-XX-XX"
                {...form.register("phone")}
                className="bg-white/50 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/70
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                           transition-all duration-300 ease-in-out" // Улучшенный фокус
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">
                Email (необязательно)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ваша@почта.ru"
                {...form.register("email")}
                className="bg-white/50 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/70
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                           transition-all duration-300 ease-in-out" // Улучшенный фокус
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferredDate" className="text-gray-800 dark:text-gray-200">
                Предпочитаемая дата <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={form.watch("preferredDate")}
                setDate={(date) => form.setValue("preferredDate", date, { shouldValidate: true })}
                placeholder="Выберите дату"
              />
              {form.formState.errors.preferredDate && (
                <p className="text-red-500 text-sm">{form.formState.errors.preferredDate.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferredTime" className="text-gray-800 dark:text-gray-200">
                Предпочитаемое время <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("preferredTime")}
                onValueChange={(value) => form.setValue("preferredTime", value, { shouldValidate: true })}
              >
                <SelectTrigger
                  id="preferredTime"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/70
                             focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                             transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-md active:scale-[0.99] active:shadow-sm" // Улучшенный фокус и анимации
                >
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out">
                  {timeSlots.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      className="transition-colors duration-200 ease-in-out hover:bg-blue-100/50 dark:hover:bg-blue-900/50" // Анимация для элементов списка
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.preferredTime && (
                <p className="text-red-500 text-sm">{form.formState.errors.preferredTime.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-gray-800 dark:text-gray-200">
                Сообщение (необязательно)
              </Label>
              <Textarea
                id="message"
                placeholder="Опишите ваши пожелания или вопросы"
                className="min-h-[100px] bg-white/50 dark:bg-gray-800/50 border-gray-200/70 dark:border-gray-700/70
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                           transition-all duration-300 ease-in-out" // Улучшенный фокус
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-red-500 text-sm">{form.formState.errors.message.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600/80 text-white font-bold py-2 px-4 rounded-lg shadow-md
                         transition-all duration-300 ease-in-out hover:bg-blue-700/90 hover:scale-[1.02] hover:shadow-lg
                         active:scale-[0.98] active:bg-blue-800/90 active:shadow-sm
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-md" // Улучшенные анимации для кнопки
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Отправка..." : "Записаться"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
