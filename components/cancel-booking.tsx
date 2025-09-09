"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, X, ArrowLeft, CheckCircle } from "lucide-react"
import { cancelAppointment, getAppointmentByCode } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface CancelBookingProps {
  onBack: () => void
}

interface AppointmentDetails {
  _id: string
  name: string
  preferredDate: string
  preferredTime: string
  bookingCode: string
  status: string
}

export function CancelBooking({ onBack }: CancelBookingProps) {
  const [bookingCode, setBookingCode] = useState("")
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const { toast } = useToast()

  const searchAppointment = async () => {
    if (bookingCode.length !== 5) {
      toast({
        title: "Ошибка",
        description: "Код записи должен содержать 5 букв",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await getAppointmentByCode(bookingCode.toUpperCase())

      if (result.success && result.appointment) {
        setAppointment(result.appointment)
      } else {
        toast({
          title: "Запись не найдена",
          description: "Проверьте правильность введенного кода",
          variant: "destructive",
        })
        setAppointment(null)
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при поиске записи",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!appointment) return

    setIsCancelling(true)
    try {
      const result = await cancelAppointment(appointment.bookingCode)

      if (result.success) {
        setCancelled(true)
        toast({
          title: "Запись отменена",
          description: "Ваша запись успешно отменена",
        })
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
        description: "Произошла ошибка при отмене записи",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-2xl border-0 rounded-3xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Запись отменена</h2>
              <p className="text-gray-600 leading-relaxed text-base">
                Ваша запись успешно отменена. Время теперь доступно для других клиентов.
              </p>
            </div>

            <Button
              onClick={onBack}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl 
                       transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Вернуться к форме
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-2xl border-0 rounded-3xl shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100/80 backdrop-blur-xl rounded-3xl mb-6 shadow-lg">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Отмена записи</h1>
            <p className="text-gray-600 text-base leading-relaxed">Введите код записи для отмены</p>
          </div>

          <div className="space-y-6">
            {/* Поле ввода кода */}
            <div className="space-y-3">
              <Label htmlFor="bookingCode" className="text-gray-700 font-semibold text-base">
                Код записи *
              </Label>
              <Input
                id="bookingCode"
                placeholder="Введите 5-буквенный код"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase().slice(0, 5))}
                className="bg-gray-50/80 backdrop-blur-xl border-0 rounded-2xl h-12 text-base font-mono text-center
                         tracking-widest text-lg font-bold
                         focus:bg-white/90 focus:ring-2 focus:ring-red-500/30 focus:shadow-lg
                         transition-all duration-150 ease-out placeholder:text-gray-400 placeholder:font-normal"
                maxLength={5}
              />
            </div>

            {/* Кнопка поиска */}
            <Button
              onClick={searchAppointment}
              disabled={bookingCode.length !== 5 || isLoading}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-2xl 
                       transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Поиск...
                </div>
              ) : (
                "Найти запись"
              )}
            </Button>

            {/* Детали найденной записи */}
            {appointment && (
              <div className="bg-red-50/80 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-900 font-semibold text-lg mb-2">Подтвердите отмену</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-700">Имя:</span>
                        <span className="font-medium text-red-900">{appointment.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Дата:</span>
                        <span className="font-medium text-red-900">
                          {format(new Date(appointment.preferredDate), "d MMMM yyyy", { locale: ru })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Время:</span>
                        <span className="font-medium text-red-900">{appointment.preferredTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Статус:</span>
                        <span className="font-medium text-red-900">
                          {appointment.status === "active" ? "Активна" : "Отменена"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {appointment.status === "active" ? (
                  <Button
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="w-full h-12 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-2xl 
                             transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]
                             disabled:opacity-50 disabled:scale-100"
                  >
                    {isCancelling ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Отменяем...
                      </div>
                    ) : (
                      "Отменить запись"
                    )}
                  </Button>
                ) : (
                  <div className="text-center text-red-700 font-medium">Эта запись уже отменена</div>
                )}
              </div>
            )}

            {/* Кнопка возврата */}
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full h-12 bg-gray-50/80 border-0 hover:bg-gray-100/80 text-gray-700 font-semibold rounded-2xl 
                       transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Вернуться к форме
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
