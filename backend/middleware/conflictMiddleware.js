import BookingModel from '../models/Booking.js';
import CoachModel from '../models/Coach.js';

export const checkBookingConflict = async (req, res, next) => {
  try {
    const { coachId, date, timeSlot, lane } = req.body;

    if (!coachId || !date || !timeSlot || !lane) {
      return res.status(400).json({ success: false, message: 'Missing parameters. Coach, date, time slot, and lane are required.' });
    }

    // 1. Verify Coach Existence
    const coach = await CoachModel.findById(coachId);
    if (!coach) {
      return res.status(404).json({ success: false, message: 'The selected coach profile was not found.' });
    }

    // Standardize date object for querying
    const queryDate = new Date(date);
    
    // 2. Check Coach Concurrency (Is this coach already booked/pending for this slot?)
    let coachConflict = await BookingModel.findOne({
      coach: coachId,
      date: queryDate,
      timeSlot: timeSlot,
      status: 'Confirmed'
    });

    if (!coachConflict) {
      coachConflict = await BookingModel.findOne({
        coach: coachId,
        date: queryDate,
        timeSlot: timeSlot,
        status: 'Pending_Approval'
      });
    }

    if (coachConflict) {
      return res.status(409).json({
        success: false,
        message: `⚠️ Concurrency Conflict: Coach ${coach.name} is already booked or has a pending reservation for the ${timeSlot} slot on this date. Double-bookings are strictly blocked.`
      });
    }

    // 3. Check Lane Concurrency (Is this specific pool lane already occupied by anyone?)
    let laneConflict = await BookingModel.findOne({
      date: queryDate,
      timeSlot: timeSlot,
      lane: Number(lane),
      status: 'Confirmed'
    });

    if (!laneConflict) {
      laneConflict = await BookingModel.findOne({
        date: queryDate,
        timeSlot: timeSlot,
        lane: Number(lane),
        status: 'Pending_Approval'
      });
    }

    if (laneConflict) {
      return res.status(409).json({
        success: false,
        message: `⚠️ Concurrency Conflict: Swimming Lane ${lane} is already reserved or pending for the ${timeSlot} slot on this date. Please select another lane.`
      });
    }

    // Pass coach object forward in req for convenience
    req.selectedCoach = coach;
    next();
  } catch (error) {
    console.error('Booking Conflict Check Error:', error);
    return res.status(500).json({ success: false, message: 'An internal error occurred while validating session availability.' });
  }
};

export default checkBookingConflict;
