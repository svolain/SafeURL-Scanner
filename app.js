const express = require('express');
const axios = require('axios');
const base64url = require('base64url');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), 'public')));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index", { result: null });
});

app.post("/", async (req, res) => {
    const { url } = req.body;

    try {
        const encodedUrl = base64url(url);
        const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
            headers: { 'x-apikey': process.env.SCAN_KEY }
        });

        const threatLevel = response.data.data.attributes.last_analysis_stats;
        const result = {
            harmless: threatLevel.harmless || 0,
            malicious: threatLevel.malicious || 0,
            suspicious: threatLevel.suspicious || 0,
            undetected: threatLevel.undetected || 0
        };

        let statusMessage = 'The URL appears to be safe.';

        if (result.malicious > 0) {
            statusMessage = 'Warning: The URL is flagged as malicious!';
        } else if (result.suspicious > 0) {
            statusMessage = 'Caution: The URL has suspicious content.';
        }

        res.render('index', { result: result, statusMessage: statusMessage });
    } catch (error) {
        console.log('Error while scanning: ', error);
        res.render('index', { result: { error: 'Failed to scan URL' } });
    }
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`server available on port ${port}`);
    });
}

module.exports = { app };