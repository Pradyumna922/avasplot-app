// ============================================================================
// 💳 PAYU PAYMENT SERVICE — Standard Checkout Logic
// Native WebView Integrated Version
// ============================================================================

import * as Crypto from 'expo-crypto';
import { ENV } from '../config/env';

export interface PayUPlan {
  name: string;
  description: string;
  /** Amount in rupees (₹4999 = 4999) */
  amount: number;
}

/**
 * Calculates PayU SHA512 Hash
 * Using strict PayU Biz format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
 */
async function generatePayUHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
}) {
  const { key, salt } = ENV.payu;

  // PayU requires exactly 16 pipes to separate 17 parameters (up to SALT)
  // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
  const hashArray = [
    key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    '', '', '', '', '', // udf1-udf5
    '', '', '', '', '', // udf6-udf10
    salt
  ];

  const hashString = hashArray.join('|');
  
  // Debug log (helpful to see the exact input to the hash)
  console.log('PayU Hash String:', hashString);
  
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA512,
    hashString
  );
}

/**
 * Prepares the HTML form for PayU POST submission.
 */
export async function getPayUPaymentHtml(
  userEmail: string,
  userName: string,
  plan: PayUPlan,
  userPhone: string = '9999999999'
) {
  const { key, sandbox } = ENV.payu;
  const txnid = `tx_${Date.now()}`;
  
  // Using 2 decimal places is often more reliable for payment gateways
  const amount = plan.amount.toFixed(2);
  const productinfo = plan.name;
  const firstname = userName.split(' ')[0] || 'User';
  
  const paymentUrl = sandbox 
    ? 'https://test.payu.in/_payment' 
    : 'https://secure.payu.in/_payment';

  const callbackScheme = 'avasplot';
  const surl = `${callbackScheme}://payment-success?txnid=${txnid}`;
  const furl = `${callbackScheme}://payment-failure?txnid=${txnid}`;

  const hash = await generatePayUHash({
    txnid,
    amount,
    productinfo,
    firstname,
    email: userEmail
  });

  return {
    txnid,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
  <style>
    body { font-family: -apple-system, sans-serif; background: #FFF; color: #0F172A;
           display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div style="text-align:center;">
    <p>Connecting to Secure Gateway...</p>
  </div>
  <form id="payu_form" action="${paymentUrl}" method="post">
    <input type="hidden" name="key" value="${key}" />
    <input type="hidden" name="txnid" value="${txnid}" />
    <input type="hidden" name="amount" value="${amount}" />
    <input type="hidden" name="productinfo" value="${productinfo}" />
    <input type="hidden" name="firstname" value="${firstname}" />
    <input type="hidden" name="email" value="${userEmail}" />
    <input type="hidden" name="phone" value="${userPhone}" />
    <input type="hidden" name="surl" value="${surl}" />
    <input type="hidden" name="furl" value="${furl}" />
    <input type="hidden" name="hash" value="${hash}" />
    <input type="hidden" name="service_provider" value="payu_paisa" />
  </form>
  <script>window.onload = function() { document.getElementById('payu_form').submit(); };</script>
</body>
</html>`
  };
}
