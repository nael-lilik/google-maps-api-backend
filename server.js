const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Middleware untuk mengizinkan CORS (jika diperlukan)
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
    const response = await fetch(url, { redirect: 'manual' });
    if (response.ok) {
      const finalUrl = response.url;
      console.log('Final URL:', finalUrl);

      const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        res.json({ success: true, coordinates: { lat, lng } });
      } else {
        res.status(400).json({ success: false, message: 'URL tidak valid atau tidak mengandung koordinat.' });
      }
    } else {
        console.log(response.url)
      res.status(response.status).json({ success: false, message: 'Gagal mengambil URL akhir.' });
    }
  } catch (error) {
    console.error('Error fetching final URL:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil URL akhir.' });
  }
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
