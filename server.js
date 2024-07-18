const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware untuk logging menggunakan morgan (default: combined)
app.use(morgan('dev')); // Gunakan 'dev' untuk format log yang lebih ringkas

// Middleware untuk mengizinkan CORS
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Endpoint untuk mendapatkan koordinat dari URL Google Maps
app.get('/api/get-coordinates', async (req, res) => {
  const { url } = req.query;

  try {
    // Mengirim permintaan untuk mengambil URL pendek dari Google Maps
    const response = await axios.get(url);
    if (response.status === 200) {
      const { data } = response;
      // Dari data, kita bisa ambil koordinatnya
      const match = data.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        res.json({ success: true, coordinates: { lat, lng } });
      } else {
        res.status(400).json({ success: false, message: 'URL tidak valid atau tidak mengandung koordinat.' });
      }
    } else {
      res.status(response.status).json({ success: false, message: 'Gagal mengambil URL akhir dari Google Maps.' });
    }
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil URL akhir.' });
  }
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
