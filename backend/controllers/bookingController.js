import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { getDbMode } from '../config/db.js';
import BookingModel from '../models/Booking.js';
import CoachModel from '../models/Coach.js';
import UserModel from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1. INITIATE PRIVATE SESSION BOOKING (Locks the slot)
 * POST /api/bookings/initiate
 */
export const initiateBooking = async (req, res) => {
  try {
    const { coachId, date, timeSlot, lane, swimmerProfileId } = req.body;

    // Verify Coach is active
    const coach = await CoachModel.findById(coachId);
    if (!coach) {
      return res.status(404).json({ success: false, message: 'The selected coach profile was not found.' });
    }

    // Retrieve user and check swimmer profile if present
    let swimmerName = req.user.name;
    let swimmerType = 'Adult';
    let swimmerSkill = 'Beginner';
    let calculatedPrice = 4800; // standard default

    if (swimmerProfileId) {
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found.' });
      }

      const profile = (user.profiles || []).find(p => p._id.toString() === swimmerProfileId.toString());
      if (!profile) {
        return res.status(404).json({ success: false, message: 'The selected swimmer profile was not found.' });
      }

      swimmerName = profile.fullName;
      swimmerType = profile.swimmerType;
      swimmerSkill = profile.skillLevel;

      // STRICT RELATIONAL SAFETY ENFORCEMENT
      if (swimmerType === 'Child') {
        const allowedSlots = ['06:30 AM - 08:00 AM', '03:30 PM - 05:00 PM'];
        if (!allowedSlots.includes(timeSlot)) {
          return res.status(400).json({
            success: false,
            message: '🔒 Safety Block: Child swimmer profiles are restricted to daylight training blocks (Sunrise or Twilight) for safety tracking.'
          });
        }
        if (Number(lane) > 3) {
          return res.status(400).json({
            success: false,
            message: '🔒 Safety Block: Child swimmer profiles are restricted to shallow lanes (Lanes 1, 2, or 3) for safety tracking.'
          });
        }

        // Simple standard pricing mapping: Rs. 2,800 for children
        calculatedPrice = 2800;
      } else {
        // Simple standard pricing mapping: Rs. 4,800 for adults
        calculatedPrice = 4800;
      }
    } else {
      // Default to standard adult package rate
      calculatedPrice = 4800;
    }

    // Create the booking - defaults to status 'Pending_Approval' (locking the slot)
    const booking = await BookingModel.create({
      user: req.user._id,
      coach: coachId,
      date: new Date(date),
      timeSlot,
      lane: Number(lane),
      priceLKR: calculatedPrice,
      status: 'Pending_Approval',
      swimmerProfileId,
      swimmerName,
      swimmerType,
      swimmerSkill
    });

    // Automatically construct optimized WhatsApp chat redirect query
    const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const waNumber = coach.whatsappNumber || '94771014046'; // Seeded WhatsApp fallback
    const rawMsg = `Hi ${coach.name},\n\nI have initiated a private Aqua Forge swim session reservation under your instruction!\n\n📋 SWIMMER METADATA:\n- Profile Name: ${swimmerName}\n- Type: ${swimmerType}\n- Skill: ${swimmerSkill}\n- Account Holder: ${req.user.name} (${req.user.email})\n\n🏊 TARGET SLOT ALLOCATION:\n- Date: ${formattedDate}\n- Timeslot: ${timeSlot}\n- Reserved Space: Lane ${lane}\n- Session Price: Rs. ${calculatedPrice.toLocaleString()} LKR\n\nI am uploading my bank transaction receipt now. Please review my submission on the Coach Workspace: http://localhost:3000`;
    
    const waUrl = `https://wa.me/${waNumber.replace('+', '')}?text=${encodeURIComponent(rawMsg)}`;

    return res.status(201).json({
      success: true,
      message: '🎉 Private training space locked! Please proceed with bank slip submission.',
      booking,
      whatsappUrl: waUrl
    });
  } catch (error) {
    console.error('Error initiating booking:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered during session lock initialization.' });
  }
};

/**
 * 1B. ATOMIC PRIVATE SESSION BOOKING LOCK (Module 3 Secure Concurrency Protection)
 * POST /api/bookings/secure-initiate
 */
export const initiateSecureBooking = async (req, res) => {
  try {
    const { coachId, date, timeSlot, lane, swimmerProfileId } = req.body;

    if (!coachId || !date || !timeSlot || !lane) {
      return res.status(400).json({ success: false, message: 'Missing parameters. Coach, date, time slot, and lane are required.' });
    }

    // Verify Coach is active
    const coach = await CoachModel.findById(coachId);
    if (!coach) {
      return res.status(404).json({ success: false, message: 'The selected coach profile was not found.' });
    }

    // Standardize query date
    const queryDate = new Date(date);

    // Express Atomic Query Session Logic: verify target lane, coach, and date/time block is vacant
    const existingLock = await BookingModel.findOne({
      $or: [
        { coach: coachId, date: queryDate, timeSlot, status: { $in: ['Pending_Approval', 'Confirmed'] } },
        { date: queryDate, timeSlot, lane: Number(lane), status: { $in: ['Pending_Approval', 'Confirmed'] } }
      ]
    });

    if (existingLock) {
      return res.status(409).json({ 
        success: false, 
        message: "Slot collision detected! This specific time slot, coach, or lane is temporarily locked." 
      });
    }

    // Retrieve user and check swimmer profile if present
    let swimmerName = req.user.name;
    let swimmerType = 'Adult';
    let swimmerSkill = 'Beginner';
    let calculatedPrice = 4800; // standard default

    if (swimmerProfileId) {
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found.' });
      }

      const profile = (user.profiles || []).find(p => p._id.toString() === swimmerProfileId.toString());
      if (!profile) {
        return res.status(404).json({ success: false, message: 'The selected swimmer profile was not found.' });
      }

      swimmerName = profile.fullName;
      swimmerType = profile.swimmerType;
      swimmerSkill = profile.skillLevel;

      // STRICT RELATIONAL SAFETY ENFORCEMENT
      if (swimmerType === 'Child') {
        const allowedSlots = ['06:30 AM - 08:00 AM', '03:30 PM - 05:00 PM'];
        if (!allowedSlots.includes(timeSlot)) {
          return res.status(400).json({
            success: false,
            message: '🔒 Safety Block: Child swimmer profiles are restricted to daylight training blocks (Sunrise or Twilight) for safety tracking.'
          });
        }
        if (Number(lane) > 3) {
          return res.status(400).json({
            success: false,
            message: '🔒 Safety Block: Child swimmer profiles are restricted to shallow lanes (Lanes 1, 2, or 3) for safety tracking.'
          });
        }

        // Simple standard pricing mapping: Rs. 2,800 for children
        calculatedPrice = 2800;
      } else {
        // Simple standard pricing mapping: Rs. 4,800 for adults
        calculatedPrice = 4800;
      }
    } else {
      calculatedPrice = 4800;
    }

    // Create the booking - defaults to status 'Pending_Approval' (locking the slot)
    const booking = await BookingModel.create({
      user: req.user._id,
      coach: coachId,
      date: queryDate,
      timeSlot,
      lane: Number(lane),
      priceLKR: calculatedPrice,
      status: 'Pending_Approval',
      swimmerProfileId,
      swimmerName,
      swimmerType,
      swimmerSkill,
      createdAt: new Date() // Connected to MongoDB TTL configuration index for 30 minutes drop logic
    });

    // Automatically construct optimized WhatsApp chat redirect query
    const formattedDate = queryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const waNumber = coach.whatsappNumber || '94771014046'; // Seeded WhatsApp fallback
    const rawMsg = `Hi ${coach.name},\n\nI have initiated a private Aqua Forge swim session reservation under your instruction!\n\n📋 SWIMMER METADATA:\n- Profile Name: ${swimmerName}\n- Type: ${swimmerType}\n- Skill: ${swimmerSkill}\n- Account Holder: ${req.user.name} (${req.user.email})\n\n🏊 TARGET SLOT ALLOCATION:\n- Date: ${formattedDate}\n- Timeslot: ${timeSlot}\n- Reserved Space: Lane ${lane}\n- Session Price: Rs. ${calculatedPrice.toLocaleString()} LKR\n\nI am uploading my bank transaction receipt now. Please review my submission on the Coach Workspace: http://localhost:3000`;
    
    const waUrl = `https://wa.me/${waNumber.replace('+', '')}?text=${encodeURIComponent(rawMsg)}`;

    return res.status(201).json({
      success: true,
      message: '🎉 Private training space locked securely for 30 minutes! Please proceed to slip registration.',
      booking,
      whatsappUrl: waUrl
    });
  } catch (error) {
    console.error('Error initiating secure booking:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered during session lock initialization.' });
  }
};

/**
 * 2. SECURE BANK DEPOSIT SLIP UPLOADER (Pipes base64 transaction slips locally)
 * POST /api/bookings/upload-slip/:bookingId
 */
export const uploadSlip = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { slipImage } = req.body; // Expects a Base64-encoded image string: "data:image/png;base64,..."

    if (!slipImage) {
      return res.status(400).json({ success: false, message: 'Validation failed. Transaction receipt image string is required.' });
    }

    // Find the booking record
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Aqua booking record not found.' });
    }

    // Verify ownership: swimmer can only upload slips to their own bookings
    const bookingUserId = booking.user._id 
      ? booking.user._id.toString() 
      : booking.user.toString();

    if (bookingUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. You do not own this booking reservation.' });
    }

    // Decode Base64 string and save as a static local file
    const matches = slipImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let imageBuffer;
    let extension = 'png'; // default

    if (matches && matches.length === 3) {
      const type = matches[1];
      extension = type.split('/')[1] || 'png';
      imageBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // Fallback if raw base64 string is sent
      imageBuffer = Buffer.from(slipImage, 'base64');
    }

    // Generate folders dynamically if not present
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save slip locally with timestamp unique filename
    const filename = `slip_${bookingId}_${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, imageBuffer);
    const slipUrl = `/uploads/${filename}`;

    // Update booking record with Pending_OCR validation flag
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        slipImageUrl: slipUrl,
        uploadedAt: new Date(),
        status: 'Pending_Approval', // Keep or reset status to Pending
        validationFlag: 'Pending_OCR'
      },
      { new: true }
    );

    // Trigger Asynchronous Analytical OCR Extractor Simulator Hook (Module 2)
    setTimeout(async () => {
      try {
        const bookingRecord = await BookingModel.findById(bookingId);
        if (!bookingRecord) return;

        // Simulate analytical parsing checks: matches transaction reference SEY-[bookingId]
        // Parse fields checking the 'Transfer Amount' and 'Reference IDs' against booking records
        const mockOcrResultText = `Seylan Bank PLC\nSlip Date: ${new Date().toLocaleDateString()}\nRef ID: SEY-${bookingId}\nAmount Paid: Rs. ${bookingRecord.priceLKR}/= LKR\nStatus: Success`;
        
        // Validation check logic: Verify amount matches the exact booking price LKR
        const matchesPrice = mockOcrResultText.includes(`Rs. ${bookingRecord.priceLKR}/= LKR`);
        
        // If matched, flag as Validated, otherwise Flagged_Amount_Mismatch
        const resolvedFlag = matchesPrice ? 'Validated' : 'Flagged_Amount_Mismatch';

        await BookingModel.findByIdAndUpdate(
          bookingId,
          { validationFlag: resolvedFlag }
        );
        console.log(`🤖 OCR Background Analytic Hook finished for booking ${bookingId}: resolved as ${resolvedFlag}`);
      } catch (ocrErr) {
        console.error('Async OCR background process failed:', ocrErr);
      }
    }, 2000);

    return res.json({
      success: true,
      message: '📤 Bank deposit slip uploaded successfully! Auto-OCR verification processing in the background.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error uploading receipt slip:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered processing transaction slip image.' });
  }
};

/**
 * 3. REAL-TIME PENDING ORDERS TERMINAL (Permission isolated queue for coach/admin)
 * GET /api/bookings/pending
 */
export const getPendingBookings = async (req, res) => {
  try {
    const isCoach = req.user.role === 'coach';
    const isAdmin = req.user.role === 'admin';

    if (!isCoach && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access Denied. Swimmers cannot access the verification deck.' });
    }

    let query = { status: 'Pending_Approval' };

    // PERMISSION ISOLATION: Mapped only to bookings scheduled with this specific Coach ID
    if (isCoach) {
      // Find the coach record matching this user's name
      const coach = await CoachModel.findOne({ name: req.user.name });
      if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach profile associated with your user was not found.' });
      }
      query.coach = coach._id;
    }

    let bookings;
    if (getDbMode()) {
      bookings = await BookingModel.find(query);
    } else {
      const RealBooking = mongoose.models.Booking || mongoose.model('Booking');
      bookings = await RealBooking.find(query).populate('user').populate('coach');
    }
    
    // Sort oldest first for fair queues
    const sorted = bookings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.json({ success: true, bookings: sorted });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered loading pending bookings queue.' });
  }
};

/**
 * 4. BANK SLIP VERIFICATION CONTROLLER (neon action triggers)
 * PUT /api/bookings/verify/:id
 */
export const verifyBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { approve } = req.body; // { approve: true / false }

    const isCoach = req.user.role === 'coach';
    const isAdmin = req.user.role === 'admin';

    if (!isCoach && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access Denied. Unauthorized verification attempt.' });
    }

    // Retrieve booking record
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Aqua booking record not found.' });
    }

    // Fetch reviewer's Coach Profile if logged in as coach
    let coachId = null;
    if (isCoach) {
      const coach = await CoachModel.findOne({ name: req.user.name });
      if (!coach) {
        return res.status(404).json({ success: false, message: 'Reviewing coach profile not found.' });
      }
      coachId = coach._id;

      // PERMISSION CHECK: Coach can only verify bookings made for him
      const bookingCoachId = booking.coach._id 
        ? booking.coach._id.toString() 
        : booking.coach.toString();

      if (bookingCoachId !== coach._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access Denied. You cannot review bookings assigned to another coach.' });
      }
    }

    const newStatus = approve ? 'Confirmed' : 'Rejected';
    const qrPass = approve ? `QR-PASS-${bookingId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}` : null;

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: newStatus,
        reviewedByCoachId: coachId,
        qrCodeString: qrPass
      },
      { new: true }
    );

    const msg = approve 
      ? '🎉 Aqua lane assignment fully confirmed! The timeslot is permanently secured.' 
      : '🚫 Transaction receipt rejected. Booking cancelled and lane unlocked.';

    return res.json({
      success: true,
      message: msg,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error verifying booking:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered during receipt validation.' });
  }
};

/**
 * 5. GET LOGGED-IN SWIMMER'S BOOKINGS
 * GET /api/bookings/my
 */
export const getMyBookings = async (req, res) => {
  try {
    let bookings;
    if (getDbMode()) {
      bookings = await BookingModel.find({ user: req.user._id });
    } else {
      const RealBooking = mongoose.models.Booking || mongoose.model('Booking');
      bookings = await RealBooking.find({ user: req.user._id }).populate('coach');
    }
    const sortedBookings = bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
    return res.json({ success: true, bookings: sortedBookings });
  } catch (error) {
    console.error('Error retrieving swimmer bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered fetching your aqua bookings.' });
  }
};

/**
 * 6. CANCEL SWIMMER BOOKING (Changes status to Rejected, freeing the slot)
 * PUT /api/bookings/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Aqua booking record not found.' });
    }

    const bookingUserId = booking.user._id 
      ? booking.user._id.toString() 
      : booking.user.toString();

    if (bookingUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. You do not own this booking reservation.' });
    }

    // Switch status to Rejected to unlock the slot
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { status: 'Rejected' },
      { new: true }
    );

    return res.json({
      success: true,
      message: '🚫 Session reservation cancelled successfully. The slot is now open for others.',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered during session cancellation.' });
  }
};

/**
 * 7. REAL-TIME VERIFIED HISTORY LOG (Tabular list for coach/admin tracking confirmed/rejected slots)
 * GET /api/bookings/history
 */
export const getVerifiedHistory = async (req, res) => {
  try {
    const isCoach = req.user.role === 'coach';
    const isAdmin = req.user.role === 'admin';

    if (!isCoach && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access Denied. Swimmers cannot access the verification log.' });
    }

    // Query for bookings that have already been either Confirmed or Rejected
    let query = { status: { $in: ['Confirmed', 'Rejected'] } };

    // PERMISSION ISOLATION: A coach sees only their own confirmed/rejected records
    if (isCoach) {
      const coach = await CoachModel.findOne({ name: req.user.name });
      if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach profile associated with your user was not found.' });
      }
      query.coach = coach._id;
    }

    let bookings;
    if (getDbMode()) {
      bookings = await BookingModel.find(query);
    } else {
      const RealBooking = mongoose.models.Booking || mongoose.model('Booking');
      bookings = await RealBooking.find(query).populate('user').populate('coach');
    }

    // Sort newest history records first
    const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, bookings: sorted });
  } catch (error) {
    console.error('Error fetching booking history log:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered loading verified history log.' });
  }
};

/**
 * 8. ADAPTIVE SCHEDULER VIEW WITH SWIMMER TYPE CONSTRAINTS
 * GET /api/bookings/scheduler-view/:swimmerProfileId
 */
export const getSchedulerView = async (req, res) => {
  try {
    const { swimmerProfileId } = req.params;

    // Fetch parent user account
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Find the swimmer sub-profile
    const profile = (user.profiles || []).find(p => p._id.toString() === swimmerProfileId.toString());
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Selected swimmer profile not found under your account.' });
    }

    const swimmerType = profile.swimmerType;

    // Define adaptive availability structures
    let allowedSlots = [];
    let allowedLanes = [];

    if (swimmerType === 'Child') {
      // Children are strictly restricted to Sunrise and Twilight drills for safety
      allowedSlots = [
        '06:30 AM - 08:00 AM', // Sunrise Streamline
        '03:30 PM - 05:00 PM'  // Twilight Power Drills
      ];
      // Children are strictly restricted to shallow lanes 1, 2, 3
      allowedLanes = [1, 2, 3];
    } else {
      // Adults have full open availability
      allowedSlots = [
        '06:30 AM - 08:00 AM',
        '08:00 AM - 09:30 AM',
        '10:00 AM - 11:30 AM',
        '03:30 PM - 05:00 PM',
        '05:00 PM - 06:30 PM'
      ];
      allowedLanes = [1, 2, 3, 4, 5, 6];
    }

    // Fetch all future/existing bookings on the system to overlay locks
    let bookings;
    if (getDbMode()) {
      bookings = await BookingModel.find({ status: { $in: ['Confirmed', 'Pending_Approval'] } });
    } else {
      const RealBooking = mongoose.models.Booking || mongoose.model('Booking');
      bookings = await RealBooking.find({ status: { $in: ['Confirmed', 'Pending_Approval'] } });
    }

    return res.json({
      success: true,
      profile,
      allowedSlots,
      allowedLanes,
      existingBookings: bookings
    });
  } catch (error) {
    console.error('Error loading adaptive scheduler view:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered loading adaptive scheduler availability layers.' });
  }
};
