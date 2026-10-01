const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    next();
});

app.get('/cloud-download', async (req, res) => {
    const targetUrl = req.query.url;
    const appName = req.query.name || 'App';

    if (!targetUrl) {
        return res.status(400).json({ error: 'Walang ibinigay na target URL.' });
    }

    try {
        console.log(`[GitHub Cloud Booster] Kinukuha ang: ${appName}`);
        
        const response = await axios({
            method: 'GET',
            url: targetUrl,
            responseType: 'stream',
            timeout: 60000
        });

        const fileName = `${appName.replace(/\s+/g, '_')}.apk`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');

        response.data.pipe(res);

    } catch (error) {
        console.error('[Error]:', error.message);
        res.status(500).json({ error: 'Nabigo ang pagkuha ng file.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Cloud Booster ay aktibo sa port ${PORT}`);
});
          
