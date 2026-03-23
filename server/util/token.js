const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const privateKey = fs.readFileSync(path.join(__dirname, process.env.PRIVATE_KEY_PATH));
const publicKey = fs.readFileSync(path.join(__dirname, process.env.PUBLIC_KEY_PATH));

const signToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '30m',  // short-lived access token
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
};
module.exports = { signToken, verifyToken };