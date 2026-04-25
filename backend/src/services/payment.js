/**
 * Mock Payment Gateway
 * 90% success rate, 2-second simulated delay
 */
const { v4: uuidv4 } = require('uuid');

const processPayment = ({ amount, method, cardDetails, phone }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() < 0.9; // 90% success
      if (success) {
        resolve({
          status: 'Success',
          gatewayReference: `GW-${uuidv4().split('-')[0].toUpperCase()}`,
          message: 'Payment processed successfully',
          amountCharged: amount,
        });
      } else {
        reject({
          status: 'Failed',
          gatewayReference: `GW-FAIL-${uuidv4().split('-')[0].toUpperCase()}`,
          message: 'Payment declined. Please check your payment details and try again.',
        });
      }
    }, 2000);
  });
};

module.exports = { processPayment };
