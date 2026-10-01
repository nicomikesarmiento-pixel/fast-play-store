const express = require('express');
const axios = require('axios');
const app = express();

// CORS para payagan ang HTML client mo na kumonekta
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/download', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Walang ibinigay na URL.');
  }

  try {
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream'
    });

    if (response.headers['content-disposition']) {
      res.setHeader('content-disposition', response.headers['content-disposition']);
    }
    res.setHeader('content-type', response.headers['content-type'] || 'application/vnd.android.package-archive');
    
    response.data.pipe(res);
  } catch (error) {
    res.status(404).send('Not found: Hindi ma-access ang file o mali ang link.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
      
