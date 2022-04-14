const jwt = require('jsonwebtoken');

// JWT 토큰 생성
function createToken(payload, expires) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });
}

module.exports.createToken = createToken;