jest.mock('pg');

describe('pool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('creates pool with correct db config', () => {
    const { Pool } = require('pg');
    Pool.mockImplementation(() => ({ query: jest.fn() }));

    require('../../util/pool');

    expect(Pool).toHaveBeenCalledWith({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  });

  it('exports the pool', () => {
    const { Pool } = require('pg');
    const mockPool = { query: jest.fn() };
    Pool.mockImplementation(() => mockPool);

    const dbPool = require('../../util/pool');

    expect(dbPool).toBe(mockPool);
  });

  it('logs success when query succeeds', () => {
    const { Pool } = require('pg');
    const fakeTime = '2024-06-01T00:00:00Z';
    const mockPool = {
      query: jest.fn((sql, cb) => cb(null, { rows: [{ now: fakeTime }] })),
    };
    Pool.mockImplementation(() => mockPool);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    require('../../util/pool');

    expect(consoleSpy).toHaveBeenCalledWith('Connected to PostgreSQL database!');
    expect(consoleSpy).toHaveBeenCalledWith('Current time from database:', fakeTime);
    consoleSpy.mockRestore();
  });

  it('logs error when query fails', () => {
    const { Pool } = require('pg');
    const fakeError = new Error('Connection refused');
    const mockPool = {
      query: jest.fn((sql, cb) => cb(fakeError)),
    };
    Pool.mockImplementation(() => mockPool);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    require('../../util/pool');

    expect(consoleSpy).toHaveBeenCalledWith('Database connection error:', fakeError);
    consoleSpy.mockRestore();
  });
});