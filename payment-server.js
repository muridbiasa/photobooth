// api/create-transaction.js
import midtransClient from 'midtrans-client';

export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
  // Hanya izinkan POST request & CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ambil key dari Environment Variables Vercel
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const parameter = {
      transaction_details: {
        order_id: `PHOTOBOOTH-${Date.now()}`,
        gross_amount: 20000
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: 'Guest',
        last_name: 'User',
        email: 'guest@photobooth.local',
        phone: '081234567890'
      },
      item_details: [{
        id: 'photobooth-session',
        price: 20000,
        quantity: 1,
        name: '4 Foto + Border Kustom'
      }]
    };

    const transaction = await snap.createTransaction(parameter);
    
    return res.status(200).json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error) {
    console.error('Midtrans Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Gagal membuat transaksi',
      details: error.message
    });
  }
}