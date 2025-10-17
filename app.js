// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;


const app = express();
app.use(cors());


app.use(bodyParser.json());

app.get('/apps/lista-file', async (req, res) => {

    const ACCESS_TOKEN = process.env.db_token;
    var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });


    // ritorna una lista di file (es. da DB)
    dbx.filesListFolder({path: ''}).then(function(response) {
        console.log(response);

       




        res.json({ ok: true, data: response});
    }).catch(function(error) {
        console.log(error);
    });


});

app.post('/apps/upload-file', async (req, res) => {
    try {


        // Recupera token per questo shop (es. da DB). Per esempio statico:
        const ACCESS_TOKEN = process.env.db_token;

        var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
        const { fileName, fileContent } = req.body;
        // Carica il file
        const response = await dbx.filesUpload({ path: '/' + fileName, contents: fileContent });
        res.json({ ok: true, data: response });
        


        // Risposta sempre generica

    } catch (e) {
        // Log interno, risposta generica all'utente
        res.json({ ok: false });
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on ' + PORT));
