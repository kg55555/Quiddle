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

});