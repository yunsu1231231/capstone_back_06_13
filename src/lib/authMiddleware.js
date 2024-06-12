// jwt가 유효한지 체크하는 미들웨어

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  const key = process.env.SECRET_KEY;
  try {
    req.decoded = jwt.verify(req.headers.authorization, key);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      }); 
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        code: 401,
        message: "유효하지 않은 토큰입니다.",
      });
    }
  }
};

module.exports = { authMiddleware };
