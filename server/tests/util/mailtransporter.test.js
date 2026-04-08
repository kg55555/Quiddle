jest.mock('nodemailer');

describe('mailer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('creates transporter with correct gmail config', () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = { verify: jest.fn() };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    require('../../util/mailtransporter');

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.GOOGLE_APP_PASS,
      },
    });
  });

  it('exports the transporter', () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = { verify: jest.fn() };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const transporter = require('../../util/mailtransporter');

    expect(transporter).toBe(mockTransporter);
  });

  it('logs success when verify succeeds', () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = { verify: jest.fn((cb) => cb(null, true)) };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    require('../../util/mailtransporter');

    expect(consoleSpy).toHaveBeenCalledWith('✅ Mailer is ready to take our messages');
    consoleSpy.mockRestore();
  });

  it('logs error when verify fails', () => {
    const nodemailer = require('nodemailer');
    const fakeError = new Error('SMTP auth failed');
    const mockTransporter = { verify: jest.fn((cb) => cb(fakeError)) };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    require('../../util/mailtransporter');

    expect(consoleSpy).toHaveBeenCalledWith('❌ Mailer connection error:', fakeError);
    consoleSpy.mockRestore();
  });
});