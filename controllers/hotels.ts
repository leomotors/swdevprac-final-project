import { Response, NextFunction } from "express";
import Hotel from "../models/Hotel";
import Booking from "../models/Booking";
import { AuthRequest } from "../middleware/auth";

//@desc Get all hotels
//@route GET /api/v1/hotels
//@access Public
export const getHotels = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let query;

  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Hotel.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = (req.query.select as string).split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = (req.query.sort as string).split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('name');
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const total = await Hotel.countDocuments();
    query = query.skip(startIndex).limit(limit);

    const hotels = await query;

    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }

    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({ success: true, count: hotels.length, pagination, data: hotels });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc Get single hotel
//@route GET /api/v1/hotels/:id
//@access Public
export const getHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc Create new hotel
//@route POST /api/v1/hotels
//@access Private
export const createHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc Update hotel
//@route PUT /api/v1/hotels/:id
//@access Private
export const updateHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!hotel) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc Delete hotel
//@route DELETE /api/v1/hotels/:id
//@access Private
export const deleteHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Cannot find hotel with the id of " + req.params.id
      });
    }

    await Booking.deleteMany({ hotel: req.params.id });
    await Hotel.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
