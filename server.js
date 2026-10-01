const express = require('express');
const axios = require('axios');
const app = express();

app.get('/download', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Walang ibinigay na URL.');
  }

  try {
    // Kinukuha ng Node.js server ang file mula sa totoong source nang may napakabilis na cloud bandwidth
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream'
    });

    // Ipinapasa agad sa user nang may mabilis na daloy
    response.headers['content-disposition'] && res.setHeader('content-disposition', response.headers['content-disposition']);
    res.setHeader('content-type', response.headers['content-type'] || 'application/octet-stream');
    
    response.data.pipe(res);
  } catch (error) {
    res.status(404).send('Not found: Hindi ma-access ang file o mali ang link.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
