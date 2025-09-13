// Без изменений
import mongoose, { Schema, type Document } from "mongoose"

export interface IAppointment extends Document {
  name: string
  phone: string
  email?: string
  preferredDate: Date
  preferredTime: string
  message?: string
  createdAt: Date
}

const AppointmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: false },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  message: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
})

const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)

export default Appointment
