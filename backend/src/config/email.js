module.exports = {
  provider: {
    // your provider name directly or from ENV var
    service: 'SendGrid',
    // auth data always from ENV vars
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_API_KEY,
    },
  },
  // defaults to be passed to nodemailer's emails
  defaults: {
    from: process.env.SENDGRID_EMAIL,
  },
};
