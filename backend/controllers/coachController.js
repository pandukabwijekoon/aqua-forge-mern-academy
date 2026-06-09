import CoachModel from '../models/Coach.js';

export const getCoaches = async (req, res) => {
  try {
    const coaches = await CoachModel.find();
    return res.json({ success: true, coaches });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered retrieving coach roster.' });
  }
};

export const getCoachById = async (req, res) => {
  try {
    const coach = await CoachModel.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ success: false, message: 'Coach profile not found.' });
    }
    return res.json({ success: true, coach });
  } catch (error) {
    console.error('Error fetching coach details:', error);
    return res.status(500).json({ success: false, message: 'Server error encountered retrieving coach profile details.' });
  }
};
