import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Bearer string
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_aqua_forge_jwt_key_2026');

      // Fetch user from database and attach to request
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authorization failed. Swimmer profile not found.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Authorization failed. Token is invalid or expired.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Authorization failed. No token provided in Bearer header.' });
  }
};
export default protect;
