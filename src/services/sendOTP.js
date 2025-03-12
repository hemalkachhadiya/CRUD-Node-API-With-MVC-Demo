import nodemailer from 'nodemailer';
import config from '../config/config.js'

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: config.EMAIL,
    pass: config.PASSWORD,
  },
});

exports.sendOTP = (to, subject, html, callback) => {
  const mailOptions = {
    from: config.EMAIL,
    to,
    subject,
    html,

  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      callback(error, null);
    } else {
      console.log("Email sent:", info.response);
      callback(null, info.response);
    }
  });
};