import midtransClient from 'midtrans-client';

export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Inisialisasi Midtrans
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    // Parameter transaksi
    const parameter = {
      transaction_details: {
        order_id: `PHOTO-${Date.now()}`,
        gross_amount: 20000
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: 'Guest',
        last_name: 'User',
        email: 'guest@photobooth.local',
        phone: '081234567890'
      }
    };

    // Buat transaksi
    const transaction = await snap.createTransaction(parameter);

    console.log('✅ Transaksi berhasil:', transaction.token);

    return res.status(200).json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error) {
    console.error('❌ Midtrans Error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Gagal membuat transaksi',
      message: error.message
    });
  }
}