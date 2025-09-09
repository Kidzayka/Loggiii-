import mongoose, { Schema, type Document } from "mongoose"

export interface IAppointment extends Document {
  name: string
  phone: string
  email?: string
  preferredDate: Date
  preferredTime: string
  message?: string
  bookingCode: string
  status: "active" | "cancelled"
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    name: {
      type: String,
      required: [true, "Имя обязательно для заполнения"],
      trim: true,
      minlength: [2, "Имя должно содержать не менее 2 символов"],
      maxlength: [50, "Имя должно содержать не более 50 символов"],
    },
    phone: {
      type: String,
      required: [true, "Телефон обязателен для заполнения"],
      trim: true,
      validate: {
        validator: (v: string) => /^[+]?[1-9][\d]{0,15}$/.test(v),
        message: "Неверный формат номера телефона",
      },
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Неверный формат email",
      },
    },
    preferredDate: {
      type: Date,
      required: [true, "Дата обязательна для заполнения"],
    },
    preferredTime: {
      type: String,
      required: [true, "Время обязательно для заполнения"],
      validate: {
        validator: (v: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: "Неверный формат времени",
      },
    },
    message: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Сообщение должно содержать не более 500 символов"],
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      length: 5,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    cancelledAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Индексы для оптимизации запросов
AppointmentSchema.index({ createdAt: -1 })
AppointmentSchema.index({ preferredDate: 1, preferredTime: 1, status: 1 })
AppointmentSchema.index({ phone: 1 })
AppointmentSchema.index({ bookingCode: 1 })
AppointmentSchema.index({ status: 1 })

// Виртуальное поле для полного имени даты и времени
AppointmentSchema.virtual("fullDateTime").get(function () {
  return `${this.preferredDate.toLocaleDateString("ru-RU")} в ${this.preferredTime}`
})

const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)

export default Appointment
