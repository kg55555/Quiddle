const { verifyToken } = require('../util/token');

const authenticate = (req, res, next) => {
try {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }


    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);  // attaches { userId, email } to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;