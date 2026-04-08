module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['routes/*.js', 'util/*.js', 'middleware/*.js', 'util/*.js'],
};