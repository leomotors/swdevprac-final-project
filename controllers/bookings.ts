import { Response, NextFunction } from "express";
import Booking, { IBooking } from "../models/Booking";
import Hotel, { IHotel } from "../models/Hotel";
import { AuthRequest } from "../middleware/auth";
import { BookingRequestSchema } from "../schemas/bookings";
import { IUser } from "../models/User";

// Helper function to send Discord webhook notification
async function sendDiscordNotification(
  booking: IBooking,
  hotel: IHotel,
  user: Omit<IUser, "password">,
  nights: number
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Discord webhook URL not configured");
    return;
  }

  const startDate = new Date(booking.startDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endDate = new Date(booking.endDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const embed = {
    title: "🏨 New Hotel Booking Created!",
    color: 0x3498db, // Blue color
    fields: [
      {
        name: "👤 Guest",
        value: user.name,
        inline: true,
      },
      {
        name: "📧 Email",
        value: user.email,
        inline: true,
      },
      {
        name: "🏨 Hotel",
        value: hotel.name,
        inline: false,
      },
      {
        name: "Star Rating",
        value: "⭐".repeat(hotel.starRating),
        inline: true,
      },
      {
        name: "📍 Address",
        value: hotel.address,
        inline: false,
      },
      {
        name: "📞 Contact",
        value: hotel.telephone,
        inline: true,
      },
      {
        name: "📅 Check-in",
        value: startDate,
        inline: true,
      },
      {
        name: "📅 Check-out",
        value: endDate,
        inline: true,
      },
      {
        name: "🌙 Nights",
        value: `${nights} Night${nights > 1 ? "s" : ""}`,
        inline: true,
      },
      {
        name: "🆔 Booking ID",
        value: `\`${booking._id}\``,
        inline: false,
      },
    ],
    footer: {
      text: "Hotel Booking System",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to send Discord notification:",
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error sending Discord notification:", error);
  }
}

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Private (user gets their own, admin gets all)
export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let query;

    // If user is not admin, only show their bookings
    if (req.user?.role !== "admin") {
      query = Booking.find({ user: req.user?.id })
        .populate({
          path: "hotel",
          select: "name address telephone starRating",
        })
        .populate({
          path: "user",
          select: "name email",
        });
    } else {
      // Admin can see all bookings
      query = Booking.find()
        .populate({
          path: "hotel",
          select: "name address telephone starRating",
        })
        .populate({
          path: "user",
          select: "name email",
        });
    }

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Private (owner or admin)
export const getBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "hotel",
        select: "name address telephone starRating",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user._id.toString() !== req.user?.id &&
      req.user?.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user?.id} is not authorized to access this booking`,
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

//@desc Add booking
//@route POST /api/v1/bookings
//@access Private
export const addBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, hotel, roomNumber } = BookingRequestSchema.parse(req.body);

    // Check if hotel exists
    const hotelExists = await Hotel.findById(hotel);

    if (!hotelExists) {
      return res.status(404).json({
        success: false,
        message: `No hotel with the id of ${hotel}`,
      });
    }

    // Validate room number
    if (roomNumber < 1 || roomNumber > hotelExists.totalRooms) {
      return res.status(400).json({
        success: false,
        message: `Invalid room number. Hotel has rooms 1-${hotelExists.totalRooms}`,
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Check for date overlap with existing bookings for this room
    const overlappingBooking = await Booking.findOne({
      hotel,
      roomNumber,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: `Room ${roomNumber} is already booked for the selected dates`,
      });
    }

    // Calculate number of nights
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if booking is more than 3 nights
    if (nights > 3) {
      return res.status(400).json({
        success: false,
        message: "Cannot book more than 3 nights",
      });
    }

    // Add user to req.body
    const bookingData = {
      startDate: start,
      endDate: end,
      hotel,
      roomNumber,
      user: req.user?.id,
    };

    const booking = await Booking.create(bookingData);

    // Send Discord notification (async, don't await to avoid blocking response)
    if (req.user) {
      sendDiscordNotification(booking, hotelExists, req.user, nights).catch(
        (err) => console.error("Discord notification error:", err)
      );
    }

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private (owner or admin)
export const updateBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user?.id &&
      req.user?.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user?.id} is not authorized to update this booking`,
      });
    }

    // Validate dates if provided
    const updateData: Partial<{
      startDate: Date;
      endDate: Date;
      hotel: string;
      roomNumber: number;
    }> = {};

    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }

    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }

    let hotelExists;
    if (req.body.hotel) {
      // Check if hotel exists
      hotelExists = await Hotel.findById(req.body.hotel);

      if (!hotelExists) {
        return res.status(404).json({
          success: false,
          message: `No hotel with the id of ${req.body.hotel}`,
        });
      }

      updateData.hotel = req.body.hotel;
    }

    if (req.body.roomNumber !== undefined) {
      const targetHotel = hotelExists || await Hotel.findById(booking.hotel);
      if (!targetHotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      if (req.body.roomNumber < 1 || req.body.roomNumber > targetHotel.totalRooms) {
        return res.status(400).json({
          success: false,
          message: `Invalid room number. Hotel has rooms 1-${targetHotel.totalRooms}`,
        });
      }

      updateData.roomNumber = req.body.roomNumber;
    }

    // Validate dates
    const start = updateData.startDate || booking.startDate;
    const end = updateData.endDate || booking.endDate;

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Calculate number of nights
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if booking is more than 3 nights
    if (nights > 3) {
      return res.status(400).json({
        success: false,
        message: "Cannot book more than 3 nights",
      });
    }

    // Check for date overlap if dates or room number changed
    if (updateData.startDate || updateData.endDate || updateData.roomNumber) {
      const checkHotel = updateData.hotel || booking.hotel;
      const checkRoom = updateData.roomNumber || booking.roomNumber;
      const checkStart = updateData.startDate || booking.startDate;
      const checkEnd = updateData.endDate || booking.endDate;

      const overlappingBooking = await Booking.findOne({
        _id: { $ne: req.params.id },
        hotel: checkHotel,
        roomNumber: checkRoom,
        $or: [
          { startDate: { $lt: checkEnd }, endDate: { $gt: checkStart } },
        ],
      });

      if (overlappingBooking) {
        return res.status(400).json({
          success: false,
          message: `Room ${checkRoom} is already booked for the selected dates`,
        });
      }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

//@desc Delete booking
//@route DELETE /api/v1/bookings/:id
//@access Private (owner or admin)
export const deleteBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user?.id &&
      req.user?.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user?.id} is not authorized to delete this booking`,
      });
    }

    await Booking.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};
