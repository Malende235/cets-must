const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 data URL
 * @param {string} data - The data to encode (booking reference, ticket ID, etc.)
 * @returns {Promise<string>} base64 PNG data URL
 */
const generateQRCode = async (data) => {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    color: { dark: '#003366', light: '#FFFFFF' },
    width: 250,
  });
};

module.exports = { generateQRCode };
