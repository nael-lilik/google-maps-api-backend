const express = require('express');
const fetch = require('node-fetch');
const app = express();

const MAX_RETRIES = 5; // Maksimum jumlah percobaan

// Middleware untuk mengizinkan CORS (jika diperlukan)
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Fungsi untuk mendapatkan URL final dengan koordinat
const getFinalUrlWithCoordinates = async (initialUrl, retries = MAX_RETRIES) => {
  let currentUrl = initialUrl;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching URL (Attempt ${i+1}/${retries}): ${currentUrl}`);
      const response = await fetch(currentUrl, {});
      if (response.ok) {
        const finalUrl = response.url;
        console.log('Final URL:', finalUrl);

        const match = finalUrl.match(/(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          return { success: true, finalUrl, coordinates: { lat, lng } };
        } else {
          // Update currentUrl to the final URL for the next iteration
          currentUrl = finalUrl;
        }
      } else {
        return { success: false, message: `Gagal mengambil URL akhir dengan status: ${response.status}` };
      }
    } catch (error) {
      console.error('Error fetching final URL:', error);
      return { success: false, message: 'Terjadi kesalahan saat mengambil URL akhir.' };
    }
  }

  return { success: false, message: 'Tidak berhasil mendapatkan URL dengan koordinat setelah beberapa kali percobaan.' };
};

// Endpoint untuk mendapatkan URL Google Maps dengan format yang benar
app.get('/api/get-coordinates', async (req, res) => {
  const { url } = req.query;

  const result = await getFinalUrlWithCoordinates(url);

  if (result.success) {
    res.json({ success: true, finalUrl: result.finalUrl, coordinates: result.coordinates });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
