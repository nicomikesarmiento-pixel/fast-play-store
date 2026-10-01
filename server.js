const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Search API para maghanap ng totoong apps mula sa Play Store / APK Mirror sources
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    try {
        // Gumagamit tayo ng search stream para makuha ang mga tugmang app
        const searchUrl = `https://www.apkmirror.com/?post_type=app_release&searchtype=apps&s=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.appRow').each((i, element) => {
            if (results.length >= 10) return;
            const title = $(element).find('.infoRow .fontName').text().trim();
            const link = 'https://www.apkmirror.com' + $(element).find('.infoRow a').attr('href');
            const icon = $(element).find('.appIcon').attr('src') || '';
            const developer = $(element).find('.byDeveloper').text().trim() || 'Google Play App';

            if (title) {
                results.push({ name: title, category: developer, icon: icon, url: link });
            }
        });

        res.json(results);
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Nabigo ang pag-search ng apps.' });
    }
});

// Download / Booster API
app.get('/cloud-download', async (req, res) => {
    const targetUrl = req.query.url;
    const appName = req.query.name || 'App';

    if (!targetUrl) return res.status(400).json({ error: 'Walang URL.' });

    try {
        let downloadUrl = targetUrl;

        // Kung galing sa APKMirror detail page, kukunin natin ang mismong download button link
        if (targetUrl.includes('apkmirror.com') && !targetUrl.includes('download')) {
            const { data } = await axios.get(targetUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
            });
            const $ = cheerio.load(data);
            const dlPageLink = 'https://www.apkmirror.com' + $('.downloadButton').attr('href');
            
            const dlResponse = await axios.get(dlPageLink, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
            });
            const $dl = cheerio.load(dlResponse.data);
            downloadUrl = 'https://www.apkmirror.com' + $dl.find('.downloadLink').attr('href');
        }

        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
            timeout: 120000
        });

        const cleanName = appName.replace(/[^a-zA-Z0-9_\-]/g, '_');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanName}.apk"`);
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        response.data.pipe(res);

    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: 'Hindi ma-download ang file.' });
    }
});

app.listen(PORT, () => console.log(`Play Store Backend active on port ${PORT}`));
            
