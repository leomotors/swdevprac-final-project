import express from "express";
import {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/bookings";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.route("/").get(protect, getBookings).post(protect, addBooking);
router
  .route("/:id")
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

export default router;
