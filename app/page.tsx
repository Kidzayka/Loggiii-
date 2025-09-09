"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { TimeSelector } from "@/components/time-selector"
import { SuccessMessage } from "@/components/success-message"
import { CancelBooking } from "@/components/cancel-booking"
import { createAppointment, getAvailableSlots, getFullyBookedDates } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentSchema, type AppointmentFormData } from "@/lib/validation"
import { Phone, Mail, Calendar, MessageSquare, User, Sparkles, AlertCircle, X } from "lucide-react"

type ViewMode = "form" | "success" | "cancel"

export default function SpeechTherapistBookingForm() {
  const [viewMode, setViewMode] = useState<ViewMode>("form")
  const [appointmentResult, setAppointmentResult] = useState<any>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [fullyBookedDates, setFullyBookedDates] = useState<Date[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
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

  const selectedDate = form.watch("preferredDate")

  // Загружаем полностью занятые дни при монтировании компонента
  useEffect(() => {
    const loadFullyBookedDates = async () => {
      try {
        const result = await getFullyBookedDates()
        if (result.success) {
          setFullyBookedDates(result.dates.map((dateStr) => new Date(dateStr)))
        }
      } catch (error) {
        console.error("Error loading fully booked dates:", error)
      }
    }

    loadFullyBookedDates()
  }, [])

  // Загружаем доступные слоты при изменении даты
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([])
        return
      }

      setIsLoadingSlots(true)
      try {
        const result = await getAvailableSlots(selectedDate)
        if (result.success) {
          setAvailableSlots(result.availableSlots)

          // Если выбранное время больше недоступно, сбрасываем его
          const currentTime = form.getValues("preferredTime")
          if (currentTime && !result.availableSlots.includes(currentTime)) {
            form.setValue("preferredTime", "")
          }
        } else {
          setAvailableSlots([])
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить доступное время",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading available slots:", error)
        setAvailableSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadAvailableSlots()
  }, [selectedDate, form, toast])

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Проверяем еще раз доступность слота перед отправкой
      if (!availableSlots.includes(data.preferredTime)) {
        toast({
          title: "Время недоступно",
          description: "Выбранное время уже занято. Пожалуйста, выберите другое время.",
          variant: "destructive",
        })
        return
      }

      const result = await createAppointment(data)

      if (result.success) {
        setAppointmentResult({
          bookingCode: result.bookingCode,
          name: data.name,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          message: data.message,
        })
        setViewMode("success")
        form.reset()
        // Обновляем доступные слоты после успешной записи
        if (selectedDate) {
          const updatedSlots = await getAvailableSlots(selectedDate)
          if (updatedSlots.success) {
            setAvailableSlots(updatedSlots.availableSlots)
          }
        }
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла неожиданная ошибка. Попробуйте еще раз.",
        variant: "destructive",
      })
    }
  }

  const handleBackToForm = () => {
    setViewMode("form")
    setAppointmentResult(null)
  }

  if (viewMode === "success") {
    return <SuccessMessage onBack={handleBackToForm} appointmentData={appointmentResult} />
  }

  if (viewMode === "cancel") {
    return <CancelBooking onBack={handleBackToForm} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* iOS-стиль заголовка */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100/80 backdrop-blur-xl rounded-3xl mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Запись к логопеду</h1>
          <p className="text-gray-600 text-lg leading-relaxed">Заполните форму для записи на консультацию</p>
        </div>

        {/* Кнопка отмены записи */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={() => setViewMode("cancel")}
            variant="outline"
            className="bg-red-50/80 border-0 hover:bg-red-100/80 text-red-700 font-medium rounded-2xl px-6 py-2
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            <X className="w-4 h-4 mr-2" />
            Отменить запись
          </Button>
        </div>

        {/* Основная карточка формы */}
        <Card className="bg-white/95 backdrop-blur-2xl border-0 rounded-3xl shadow-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Имя */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-gray-700 font-semibold flex items-center text-base">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  Ваше имя *
                </Label>
                <Input
                  id="name"
                  placeholder="Введите ваше имя"
                  {...form.register("name")}
                  className="bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl h-12 text-base font-medium px-4
                           focus:bg-white/90 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg
                           transition-all duration-150 ease-out placeholder:text-gray-400"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm font-medium ml-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Телефон */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-gray-700 font-semibold flex items-center text-base">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Phone className="w-3 h-3 text-green-600" />
                  </div>
                  Телефон *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  {...form.register("phone")}
                  className="bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl h-12 text-base font-medium px-4
                           focus:bg-white/90 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg
                           transition-all duration-150 ease-out placeholder:text-gray-400"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm font-medium ml-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center text-base">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Mail className="w-3 h-3 text-purple-600" />
                  </div>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...form.register("email")}
                  className="bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl h-12 text-base font-medium px-4
                           focus:bg-white/90 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg
                           transition-all duration-150 ease-out placeholder:text-gray-400"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm font-medium ml-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Дата и время */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold flex items-center text-base">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="w-3 h-3 text-orange-600" />
                    </div>
                    Дата *
                  </Label>
                  <DatePicker
                    date={selectedDate}
                    setDate={(date) => {
                      form.setValue("preferredDate", date, { shouldValidate: true })
                      // Сбрасываем время при изменении даты
                      form.setValue("preferredTime", "")
                    }}
                    placeholder="Выберите дату"
                    disabledDates={fullyBookedDates}
                  />
                  {form.formState.errors.preferredDate && (
                    <p className="text-red-500 text-sm font-medium ml-1">
                      {form.formState.errors.preferredDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold flex items-center text-base">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-3 h-3 text-teal-600" />
                    </div>
                    Время *
                  </Label>
                  <TimeSelector
                    value={form.watch("preferredTime")}
                    onValueChange={(value) => form.setValue("preferredTime", value, { shouldValidate: true })}
                    availableSlots={availableSlots}
                    isLoading={isLoadingSlots}
                  />
                  {form.formState.errors.preferredTime && (
                    <p className="text-red-500 text-sm font-medium ml-1">
                      {form.formState.errors.preferredTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Информация о доступности */}
              {selectedDate && (
                <div className="bg-blue-50/80 backdrop-blur-xl rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <AlertCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium text-sm">
                        {isLoadingSlots
                          ? "Проверяем доступность..."
                          : availableSlots.length > 0
                            ? `Доступно ${availableSlots.length} слотов на выбранную дату`
                            : "На выбранную дату нет свободного времени"}
                      </p>
                      {!isLoadingSlots && availableSlots.length === 0 && selectedDate && (
                        <p className="text-blue-700 text-xs mt-1">Попробуйте выбрать другую дату</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Сообщение */}
              <div className="space-y-3">
                <Label htmlFor="message" className="text-gray-700 font-semibold flex items-center text-base">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                    <MessageSquare className="w-3 h-3 text-pink-600" />
                  </div>
                  Дополнительная информация
                </Label>
                <Textarea
                  id="message"
                  placeholder="Расскажите о ваших пожеланиях или вопросах..."
                  className="bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl min-h-[100px] resize-none 
                           text-base font-medium px-4 py-3
                           focus:bg-white/90 focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg
                           transition-all duration-150 ease-out placeholder:text-gray-400"
                  {...form.register("message")}
                />
                {form.formState.errors.message && (
                  <p className="text-red-500 text-sm font-medium ml-1">{form.formState.errors.message.message}</p>
                )}
              </div>

              {/* Кнопка отправки */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !selectedDate || availableSlots.length === 0}
                  className="w-full h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-lg
                           rounded-2xl transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]
                           disabled:opacity-50 disabled:scale-100 shadow-xl hover:shadow-2xl
                           disabled:cursor-not-allowed"
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                      <span>Отправляем...</span>
                    </div>
                  ) : !selectedDate ? (
                    "Выберите дату"
                  ) : availableSlots.length === 0 ? (
                    "Нет доступного времени"
                  ) : (
                    "Записаться на консультацию"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Дополнительная информация */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Мы работаем с понедельника по пятницу с 9:00 до 18:00</p>
          <p className="mt-1">Мы свяжемся с вами в течение 24 часов для подтверждения записи</p>
        </div>
      </div>
    </div>
  )
}
