const jwt = require('jsonwebtoken');

/**
 * Auth Middleware — protects routes that require login
 * 
 * How it works:
 * 1. Reads the JWT token from the Authorization header
 * 2. Verifies it using our JWT_SECRET
 * 3. If valid, attaches the decoded user id to req.user
 * 4. If invalid, returns a 401 Unauthorized error
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists and is in the right format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1]; // extract just the token part

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded = { id: userId, iat: ..., exp: ... }
    next(); // pass control to the next middleware/route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired. Please log in again.' });
  }
};

module.exports = protect;
