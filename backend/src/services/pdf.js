const PDFDocument = require('pdfkit');

/**
 * Generate a PDF ticket buffer
 */
const generateTicketPDF = async ({
  bookingRef,
  fullName,
  eventTitle,
  eventDate,
  eventTime,
  location,
  quantity,
  qrCodeDataUrl,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A5', margin: 40 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header band
      doc.rect(0, 0, doc.page.width, 90).fill('#003366');

      // University name
      doc.fillColor('#FFB800').fontSize(20).font('Helvetica-Bold')
        .text('CETS · MUST', 40, 20, { align: 'left' });
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica')
        .text('Mbarara University of Science and Technology', 40, 46);
      doc.fillColor('#FFB800').fontSize(12).font('Helvetica-Bold')
        .text('Campus Event & Ticketing System', 40, 62);

      // Ticket title
      doc.fillColor('#003366').fontSize(16).font('Helvetica-Bold')
        .text(eventTitle, 40, 110, { width: 330 });

      // Divider
      doc.moveTo(40, 145).lineTo(doc.page.width - 40, 145).strokeColor('#e0e0e0').stroke();

      // Details
      const details = [
        ['Booking Reference', bookingRef],
        ['Attendee', fullName],
        ['Date', eventDate],
        ['Time', eventTime],
        ['Venue', location],
        ['Tickets', String(quantity)],
      ];

      let y = 158;
      details.forEach(([label, value]) => {
        doc.fillColor('#888888').fontSize(8).font('Helvetica').text(label.toUpperCase(), 40, y);
        doc.fillColor('#111111').fontSize(11).font('Helvetica-Bold').text(value, 40, y + 12);
        y += 38;
      });

      // QR code
      if (qrCodeDataUrl) {
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imgBuffer, doc.page.width - 190, 110, { width: 150, height: 150 });
      }

      // Bottom status
      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#003366');
      doc.fillColor('#FFB800').fontSize(10).font('Helvetica-Bold')
        .text('Status: VALID', 40, doc.page.height - 35);
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica')
        .text('Present this ticket at the entrance', 40, doc.page.height - 22);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateTicketPDF };
