import mongoose, { Document, Schema } from "mongoose";

export interface IHotel extends Document {
  name: string;
  address: string;
  telephone: string;
  starRating: number;
}

const HotelSchema = new Schema<IHotel>({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  telephone: {
    type: String,
    required: [true, "Please add a telephone number"],
  },
  starRating: {
    type: Number,
    required: [true, "Please add a star rating"],
    min: 1,
    max: 5,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

HotelSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "hotel",
  justOne: false,
});

export default mongoose.model<IHotel>("Hotel", HotelSchema);
