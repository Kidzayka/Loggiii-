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
    form.clearErrors() // Очищаем предыдущие ошибки

    const result = await createAppointment(data)

    if (result.success) {
      toast({
        title: "Успех!",
        description: result.message,
      })
      form.reset() // Очистка формы после успешной отправки
    } else {
      toast({
        title: "Ошибка",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Запись на занятие к логопеду</CardTitle>
          <CardDescription>Пожалуйста, заполните форму, чтобы записаться на консультацию.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Имя <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="Ваше имя" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">
                Телефон <span className="text-red-500">*</span>
              </Label>
              <Input id="phone" type="tel" placeholder="+7 (XXX) XXX-XX-XX" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (необязательно)</Label>
              <Input id="email" type="email" placeholder="ваша@почта.ru" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferredDate">
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
              <Label htmlFor="preferredTime">
                Предпочитаемое время <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("preferredTime")}
                onValueChange={(value) => form.setValue("preferredTime", value, { shouldValidate: true })}
              >
                <SelectTrigger id="preferredTime">
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
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
              <Label htmlFor="message">Сообщение (необязательно)</Label>
              <Textarea
                id="message"
                placeholder="Опишите ваши пожелания или вопросы"
                className="min-h-[100px]"
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-red-500 text-sm">{form.formState.errors.message.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Отправка..." : "Записаться"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
