const nodemailer = require("nodemailer");
const staff = require('../models/staff');
const admin = require('../models/admin');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendMail = async(options)=>{
    try {
  const info = await transporter.sendMail({
    from: `"Picker" <process.env.SMTP_USER>`, // sender address
    to: options.email, // list of recipients
    subject: options.subject, // subject line
    // text: "Hello world?", // plain text body
    html: options.html, // HTML body
  });

  console.log("Message sent: %s", info.messageId);
    console.log("Message sent to: %s", options.email);
 
} catch (err) {
  console.error("Error while sending mail:", err);
}
}

module.exports = sendMail
