const express = require('express');
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Proxy Download Route - Ang server ang magda-download at magpapabilis
app.get('/download', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Walang ibinigay na URL.');
  }

  try {
    console.log(`⚡ Sinisimulan ng server ang paghila ng file mula sa: ${targetUrl}`);
    
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream',
      timeout: 60000 // 1 minute timeout para sa malalaking laro/APK
    });

    // Ipasa ang headers para madetect na ito ay file download
    if (response.headers['content-disposition']) {
      res.setHeader('content-disposition', response.headers['content-disposition']);
    } else {
      res.setHeader('content-disposition', 'attachment; filename="downloaded-file.apk"');
    }
    
    res.setHeader('content-type', response.headers['content-type'] || 'application/vnd.android.package-archive');

    // I-stream ang data direkta mula sa server patungo sa nag-request
    response.data.pipe(res);

  } catch (error) {
    console.error('Error sa pag-download:', error.message);
    res.status(500).send('Nabigo ang server na makuha ang file. Siguraduhing tama ang direct link.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Turbo Server ay aktibo sa port ${PORT}`);
});
