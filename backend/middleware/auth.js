import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not Authorized. Please log in again.',
    });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
      });
    } else {
      console.log(error);
      return res.status(403).json({
        success: false,
        message: 'Invalid token. Access denied.',
      });
    }
  }
};

export default authMiddleware;
