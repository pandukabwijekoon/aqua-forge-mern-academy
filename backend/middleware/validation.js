export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Swimmer name cannot be empty.' });
  }

  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  // Regex validation for email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Invalid email address syntax.' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Security password must be at least 8 characters long.' });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
};
