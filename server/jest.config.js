module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['routes/*.js', 'util/*.js', 'middleware/*.js'],
  globalTeardown: './tests/teardown.js',
};