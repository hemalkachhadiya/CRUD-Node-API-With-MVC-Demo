
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dns = require('dns');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pfHost = 'sandbox.payfast.co.za';
const passPhrase = 'jt7NOE43FZPn';

const generateSignature = (data, passPhrase = null) => {
    let pfOutput = '';
    for (let key in data) {
        if (data.hasOwnProperty(key) && data[key] !== '') {
            pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
        }
    }
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
    }
    return crypto.createHash('md5').update(getString).digest('hex');
};

const ipLookup = async (domain) => {
    return new Promise((resolve, reject) => {
        dns.lookup(domain, { all: true }, (err, address) => {
            if (err) {
                reject(err);
            } else {
                const addressIps = address.map(item => item.address);
                resolve(addressIps);
            }
        });
    });
};

const pfValidIP = async (req) => {
    const validHosts = [
        'www.payfast.co.za',
        'sandbox.payfast.co.za',
        'w1w.payfast.co.za',
        'w2w.payfast.co.za'
    ];

    let validIps = [];
    const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        for (let host of validHosts) {
            const ips = await ipLookup(host);
            validIps = [...validIps, ...ips];
        }
    } catch (err) {
        console.error(err);
    }

    const uniqueIps = [...new Set(validIps)];
    return uniqueIps.includes(pfIp);
};

const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
    if (pfPassphrase !== null) {
        pfParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, '+')}`;
    }
    const signature = crypto.createHash('md5').update(pfParamString).digest('hex');
    return pfData['signature'] === signature;
};

const pfValidPaymentData = (cartTotal, pfData) => {
    return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
};

const pfValidServerConfirmation = async (pfHost, pfParamString) => {
    try {
        const response = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString);
        return response.data === 'VALID';
    } catch (error) {
        console.error(error);
        return false;
    }
};

exports.payFast = async (req, res) => {
    const m_payment_id = uuidv4();

    const myData = {
        merchant_id: '10033809',
        merchant_key: '96dv9iwvt3l7m',
        return_url: 'https://kutuma.tech/api/v1/notify-payment',
        cancel_url: 'https://kutuma.tech/api/v1/notify-payment',
        notify_url: 'https://kutuma.tech/api/v1/notify-payment',
        name_first: req.body.name_first,
        name_last: req.body.name_last,
        email_address: req.body.email_address,
        m_payment_id: m_payment_id,
        amount: req.body.amount,
        item_name: "delivery",
    };

    myData['signature'] = generateSignature(myData, passPhrase);

    res.json({
        url: `https://${pfHost}/eng/process`,
        data: myData,
    });
};

 exports.payFastNotify = async (req, res) => {
    console.log("PayFast notification");
    const pfData = { ...req.body };
    const pfParamString = Object.keys(pfData)
        .filter(key => key !== 'signature')
        .map(key => `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, '+')}`)
        .join('&');

    const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
    const check2 = await pfValidIP(req);
    const check3 = pfValidPaymentData('10.00', pfData); // Example cart total
    const check4 = await pfValidServerConfirmation(pfHost, pfParamString);

    if (check1 && check2 && check3 && check4) {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
};

