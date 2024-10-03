const unirest = require('unirest');
const Buffer = require('buffer').Buffer;
const moment = require('moment');

const secret = 'jL1kxfvJraHEi1rZaOMUUK8SjcjJyYfZo0IDVVdXyjbpYgPQ';
const consumer = 'JZSXj12oXVcRiucSi8vaiFKBXGxBfVAc1vlj7L80UZUFNtGB9G0FizG1RsGd1335';
const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Example passkey, replace with your actual passkey
const callback = 'https://89f4-41-90-112-42.ngrok-free.app/api/auth/mpesa/callback'; // Example passkey, replace with your actual passkey

/**
 * Request M-Pesa OAuth Access Token
 */
const requestAccessToken = async () => {
    try {
        const auth = Buffer.from(`${secret}:${consumer}`).toString('base64');

        return new Promise((resolve, reject) => {
            unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
                .headers({
                    'Authorization': `Basic ${auth}`
                })
                .end(res => {
                    if (res.error) {
                        console.error('Error getting M-Pesa OAuth token:', res.error);
                        reject(new Error(res.error));
                    } else {
                        console.log('M-Pesa OAuth Token Response:', res.raw_body);
                        const tokenResponse = JSON.parse(res.raw_body);
                        resolve(tokenResponse);
                    }
                });
        });
    } catch (error) {
        console.error('Failed to get access token:', error.message);
        throw new Error(`Failed to get access token: ${error.message}`);
    }
};

const getTimestamp = () => {
    return moment().format('YYYYMMDDHHmmss');
};

const generatePassword = (shortCode, passkey, timestamp) => {
    const dataToEncode = `${shortCode}${passkey}${timestamp}`;
    return Buffer.from(dataToEncode).toString('base64');
};

/**
 * Initiate M-Pesa STK Push.
 */
const shortCode = 174379;
const initiateSTKPush = async (phoneNumber, amount, accountReference, transactionDesc) => {
    try {
        const accessToken = await requestAccessToken();  // Fetch the OAuth token
        const timestamp = getTimestamp();  // Get the current timestamp
        const password = generatePassword(shortCode, passkey, timestamp);  // Generate the dynamic password
        console.log("password", password);

        // Make the STK Push request
        return new Promise((resolve, reject) => {
            unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
                .headers({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken.access_token}`,  // Use the OAuth token
                })
                .send(JSON.stringify({
                    "BusinessShortCode": shortCode,
                    "Password": password,
                    "Timestamp": timestamp,
                    "TransactionType": "CustomerPayBillOnline",
                    "Amount": amount,
                    "PartyA": phoneNumber,  // The customer's phone number
                    "PartyB": shortCode,
                    "PhoneNumber": phoneNumber,
                    "CallBackURL": callback,
                    "AccountReference": accountReference,  // Reference number or order ID
                    "TransactionDesc": transactionDesc || 'Payment'  // Description of the payment
                }))
                .end(res => {
                    if (res.error) {
                        console.error('Error initiating STK Push:', res.error);
                        reject(new Error(res.error));
                    } else {
                        console.log('STK Push Response:', res.raw_body);
                        resolve(JSON.parse(res.raw_body));
                    }
                });
        });
    } catch (error) {
        console.error('M-Pesa STK Push error:', error.message);
        throw new Error(`M-Pesa STK Push error: ${error.message}`);
    }
};

module.exports = {
    requestAccessToken,
    initiateSTKPush
};