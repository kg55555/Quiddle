const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * This module provides utility functions for signing and verifying JSON Web Tokens (JWTs) using the RS256 algorithm. 
 * It reads the private and public keys from environment variables, ensuring that they are set before allowing token operations. 
 * The `signToken` function creates a JWT with a specified payload and an expiration time of 1 day, while the `verifyToken` function checks the validity of a given token against the public key. 
 * Both functions are exported for use in authentication-related parts of the application.
 */
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

if (!privateKey || !publicKey) {
  throw new Error('PRIVATE_KEY and PUBLIC_KEY environment variables must be set');
}

const signToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
};

module.exports = { signToken, verifyToken };