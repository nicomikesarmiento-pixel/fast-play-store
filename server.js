const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/cloud-download', async (req, res) => {
    const targetUrl = req.query.url;
    const appName = req.query.name || 'App';

    if (!targetUrl) {
        return res.status(400).json({ error: 'Walang ibinigay na target URL.' });
    }

    try {
        console.log(`[Universal Cloud Booster] Kino-connect ang: ${appName} (${targetUrl})`);
        
        const response = await axios({
            method: 'GET',
            url: targetUrl,
            responseType: 'stream',
            maxRedirects: 10,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 120000
        });

        const cleanName = appName.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const fileName = `${cleanName}.apk`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');

        response.data.pipe(res);

    } catch (error) {
        console.error('[Error sa Pagkuha]:', error.message);
        res.status(500).json({ error: 'Nabigo ang cloud server na kunin ang file mula sa target URL.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Universal Cloud Booster ay aktibo sa port ${PORT}`);
});
