import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  startDate: Date;
  endDate: Date;
  user: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  startDate: {
    type: Date,
    required: [true, "Please add a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hotel: {
    type: Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IBooking>("Booking", BookingSchema);
