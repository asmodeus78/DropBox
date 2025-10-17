// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;

// Imposta: TOKEN_ADMIN per il negozio (o recuperalo dinamicamente per ogni shop)
const ADMIN_API_VERSION = '2025-07';

const app = express();
app.use(cors());


app.use(bodyParser.json());

// Facoltativo: middleware per verificare la firma dell'App Proxy (HMAC)
// Implementa la verifica di 'signature' o 'signed_fields' come da docs Shopify.

app.post('/apps/upload-file', async (req, res) => {
    try {


        // Recupera token per questo shop (es. da DB). Per esempio statico:
        const ACCESS_TOKEN = process.env.db_token;

        var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
        dbx.filesListFolder({path: ''})
            .then(function(response) {
                console.log(response);
                res.json({ ok: true, data: response });
            })
            .catch(function(error) {
                console.log(error);
            });



        // Risposta sempre generica

    } catch (e) {
        // Log interno, risposta generica all'utente
        res.json({ ok: false });
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on ' + PORT));
