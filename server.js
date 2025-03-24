require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, 'src')));

app.use('/libs', express.static(path.join(__dirname, 'node_modules')));

app.get('/config', (req, res) => {
    const config = {
        baseUrl: process.env.BASE_URL,
        realm: process.env.REALM,
        grantType: process.env.GRANT_TYPE,
        clientId: process.env.CLIENT_ID,
        username: process.env.APP_USERNAME,
        password: process.env.PASSWORD
    };

    res.json(config);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
