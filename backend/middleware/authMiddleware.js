const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const logPrefix = `[Auth Middleware - ${req.method} ${req.path}]`;
  console.log(`${logPrefix} Started.`);
  // Log all headers received by the middleware for debugging
  // console.log(`${logPrefix} Received Headers:`, JSON.stringify(req.headers, null, 2)); // Keep this commented unless needed again

  console.log(`${logPrefix} Accessing req.headers.authorization...`);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error(`${logPrefix} Error: Authorization header missing.`);
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  // console.log(`${logPrefix} Authorization header found: ${authHeader.substring(0, 15)}...`); // Log prefix only

  // console.log(`${logPrefix} Splitting header...`);
  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      console.error(`${logPrefix} Error: Malformed Authorization header. Expected 'Bearer <token>'. Found:`, authHeader);
      return res.status(401).json({ message: 'Malformed Authorization header.' });
  }

  const token = tokenParts[1];
  if (!token) {
    // This case should theoretically be caught by the split check above, but included for safety
    console.error(`${logPrefix} Error: Token missing after split.`);
    return res.status(401).json({ message: 'Token missing' });
  }
  // console.log(`${logPrefix} Token extracted: ${token.substring(0, 15)}...`);

  try {
    // console.log(`${logPrefix} Verifying token...`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(`${logPrefix} Token verified successfully. Decoded payload:`, decoded);
    req.user = decoded; // Attach user info to the request object
    // console.log(`${logPrefix} req.user populated.`);
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(`${logPrefix} Error verifying token:`, error.name, error.message);
    console.error(`${logPrefix} Full Error:`, error);
    // Distinguish between specific JWT errors and others
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token.' });
    } else if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired.' });
    } else {
        // General error during verification
        return res.status(500).json({ message: 'Token verification failed.' });
    }
    // Original simpler catch: res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
