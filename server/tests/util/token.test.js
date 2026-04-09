jest.mock('jsonwebtoken');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('jwt utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    delete process.env.PRIVATE_KEY;
    delete process.env.PUBLIC_KEY;
  });

  describe('signToken', () => {
    beforeEach(() => {
      process.env.PRIVATE_KEY = 'fake-private-key';
      process.env.PUBLIC_KEY = 'fake-public-key';
    });

    it('signs token with private key and RS256', () => {
      const jwt = require('jsonwebtoken');
      const { signToken } = require('../../util/token');

      jwt.sign.mockReturnValue('signed-token');

      const result = signToken({ userId: 1 });

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1 },
        'fake-private-key',
        { algorithm: 'RS256', expiresIn: '1d' }
      );
      expect(result).toBe('signed-token');
    });
  });

  describe('verifyToken', () => {
    beforeEach(() => {
      process.env.PRIVATE_KEY = 'fake-private-key';
      process.env.PUBLIC_KEY = 'fake-public-key';
    });

    it('verifies token with public key and RS256', () => {
      const jwt = require('jsonwebtoken');
      const { verifyToken } = require('../../util/token');

      const fakePayload = { userId: 1 };
      jwt.verify.mockReturnValue(fakePayload);

      const result = verifyToken('some-token');

      expect(jwt.verify).toHaveBeenCalledWith(
        'some-token',
        'fake-public-key',
        { algorithms: ['RS256'] }
      );
      expect(result).toBe(fakePayload);
    });

    it('throws when token is invalid', () => {
      const jwt = require('jsonwebtoken');
      const { verifyToken } = require('../../util/token');

      jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

      expect(() => verifyToken('bad-token')).toThrow('invalid token');
    });

    it('throws when token is expired', () => {
      const jwt = require('jsonwebtoken');
      const { verifyToken } = require('../../util/token');

      jwt.verify.mockImplementation(() => {
        const err = new Error('jwt expired');
        err.name = 'TokenExpiredError';
        throw err;
      });

      expect(() => verifyToken('expired-token')).toThrow('jwt expired');
    });
  });

    describe('missing env vars', () => {

        it('throws on startup if PUBLIC_KEY is missing', () => {
            process.env.PRIVATE_KEY = 'fake-private-key';
            delete process.env.PUBLIC_KEY;

            jest.isolateModules(() => {
            expect(() => {
                require('../../util/token');
            }).toThrow('PRIVATE_KEY and PUBLIC_KEY environment variables must be set');
            });
        });

        it('throws on startup if PRIVATE_KEY is missing', () => {
            jest.isolateModules(() => {
            delete process.env.PRIVATE_KEY;
            process.env.PUBLIC_KEY = 'fake-public-key';

            expect(() => {
                require('../../util/token');
            }).toThrow('PRIVATE_KEY and PUBLIC_KEY environment variables must be set');
            });
        });
    });
});