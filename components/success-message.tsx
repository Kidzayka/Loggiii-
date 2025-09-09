"use client"

import { CheckCircle, Star, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { SmartCalendarIntegration } from "@/components/smart-calendar-integration"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface SuccessMessageProps {
  onBack: () => void
  appointmentData?: {
    bookingCode: string
    name: string
    preferredDate: Date
    preferredTime: string
    message?: string
  }
}

export function SuccessMessage({ onBack, appointmentData }: SuccessMessageProps) {
  const [codeCopied, setCodeCopied] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-2xl border-0 rounded-3xl shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Анимированная иконка успеха */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Запись создана!</h2>
            <p className="text-gray-600 leading-relaxed text-base mb-4">
              Мы получили вашу заявку и свяжемся с вами в ближайшее время для подтверждения.
            </p>
          </div>

          {/* Код записи */}
          {appointmentData && (
            <div className="bg-blue-50/80 backdrop-blur-xl rounded-2xl p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-blue-900 font-semibold text-lg mb-2">Ваш код записи</h3>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-white/90 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-blue-600 tracking-widest">
                    {appointmentData.bookingCode}
                  </div>
                  <Button
                    onClick={() => {}}
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 rounded-xl hover:bg-blue-100/50"
                  >
                    {codeCopied ? (
                      <ArrowLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowLeft className="w-5 h-5 text-blue-600" />
                    )}
                  </Button>
                </div>
                <p className="text-blue-700 text-sm mt-3">Сохраните этот код - он понадобится для отмены записи</p>
              </div>

              {/* Детали записи */}
              <div className="text-left bg-white/50 rounded-xl p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата:</span>
                    <span className="font-medium text-gray-900">
                      {format(appointmentData.preferredDate, "d MMMM yyyy", { locale: ru })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Время:</span>
                    <span className="font-medium text-gray-900">{appointmentData.preferredTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Имя:</span>
                    <span className="font-medium text-gray-900">{appointmentData.name}</span>
                  </div>
                </div>
              </div>

              {/* Интеграция с календарем */}
              {appointmentData && <SmartCalendarIntegration appointmentData={appointmentData} />}
            </div>
          )}

          {/* Блок с отзывом */}
          <div className="bg-orange-50/80 backdrop-blur-xl rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-orange-900 font-semibold text-lg">Оставьте отзыв</span>
            </div>
            <p className="text-orange-700 text-sm mb-4 leading-relaxed">Поделитесь своим мнением о нашем сервисе</p>
            <Button
              onClick={() => window.open("https://yandex.ru/maps/org/example", "_blank")}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-2xl 
                       transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Оставить отзыв
            </Button>
          </div>

          {/* Кнопка возврата */}
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12 bg-gray-50/80 border-0 hover:bg-gray-100/80 text-gray-700 font-semibold rounded-2xl 
                     transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Новая запись
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
