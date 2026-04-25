const nodemailer = require('nodemailer');
require('dotenv').config();

// In dev/mock mode, log emails to console
const isMock = process.env.NODE_ENV !== 'production';

const transporter = nodemailer.createTransport(
  isMock
    ? { jsonTransport: true } // mock – doesn't send real emails
    : {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      }
);

const sendTicketConfirmation = async ({ to, fullName, bookingRef, eventTitle, eventDate, eventTime, location, qrCode, quantity }) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
      <div style="background:#003366;padding:24px;text-align:center">
        <h1 style="color:#FFB800;margin:0;font-size:24px">CETS · MUST</h1>
        <p style="color:#fff;margin:4px 0 0">Campus Event & Ticketing System</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#003366">Booking Confirmed! 🎉</h2>
        <p>Hi <strong>${fullName}</strong>,</p>
        <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Booking Reference</td><td style="padding:8px">${bookingRef}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Event</td><td style="padding:8px">${eventTitle}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Date & Time</td><td style="padding:8px">${eventDate} at ${eventTime}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Venue</td><td style="padding:8px">${location}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Tickets</td><td style="padding:8px">${quantity}</td></tr>
        </table>
        <p>Show your QR code at the entrance.</p>
        ${qrCode ? `<img src="${qrCode}" alt="QR Code" style="width:180px;height:180px" />` : ''}
      </div>
      <div style="background:#003366;padding:12px;text-align:center;color:#aaa;font-size:12px">
        Mbarara University of Science and Technology · MUST, Uganda
      </div>
    </div>
  `;

  const mail = {
    from: process.env.EMAIL_FROM || 'CETS MUST <cets@must.ac.ug>',
    to,
    subject: `✅ Booking Confirmed – ${eventTitle} [${bookingRef}]`,
    html,
  };

  if (isMock) {
    console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${mail.subject}`);
    return { messageId: `mock-${Date.now()}` };
  }
  return transporter.sendMail(mail);
};

const sendCancellationEmail = async ({ to, fullName, bookingRef, eventTitle }) => {
  if (isMock) {
    console.log(`📧 [MOCK EMAIL - CANCEL] To: ${to} | Booking: ${bookingRef}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Ticket Cancelled – ${eventTitle} [${bookingRef}]`,
    html: `<p>Hi ${fullName}, your ticket (${bookingRef}) for ${eventTitle} has been cancelled.</p>`,
  });
};

module.exports = { sendTicketConfirmation, sendCancellationEmail };
