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

const multer = require('multer');
const upload = multer({ /* opzionale: limits: { fileSize: 50 * 1024 * 1024 } */ });

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

app.post('/apps/upload-file',upload.single('file'), async (req, res) => {
    try {


        // Recupera token per questo shop (es. da DB). Per esempio statico:
        const ACCESS_TOKEN = process.env.db_token;

        var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
        if (!req.file) {
            return res.status(400).json({ ok: false, errore: 'Nessun file ricevuto' });
        }

        const uploaded = await dbx.filesUpload({
            path: '/' + req.file.originalname,
            contents: req.file.buffer,
            mode: { '.tag': 'overwrite' } // opzionale
        });

        const path = uploaded.result?.path_lower || uploaded.path_lower || ('/' + req.file.originalname);

        let sharedUrl;
        try {
            const linkRes = await dbx.sharingCreateSharedLinkWithSettings({
                path,
                settings: { requested_visibility: { '.tag': 'public' } } // chiunque con il link
            });
            const url = linkRes.result?.url || linkRes.url;
            sharedUrl = url.replace('?dl=0', '?dl=1'); // forza download
        } catch (err) {
        // Se il link esiste già, recuperalo
            const tag = err?.error?.error?.['.tag'] || err?.error?.['.tag'];
            if (tag === 'shared_link_already_exists') {
                const list = await dbx.sharingListSharedLinks({ path, direct_only: true });
                const url = list.result?.links?.[0]?.url || list.links?.[0]?.url;
                if (!url) throw new Error('Impossibile recuperare il link esistente');
                sharedUrl = url.replace('?dl=0', '?dl=1');
            } else {
                throw err;
            }
        }


        res.json({
            ok: true,
            data: {
                name: req.file.originalname,
                path,
                downloadUrl: sharedUrl // link pubblico per scaricare
            }
        });
        


    } catch (e) {
        // Log interno, risposta generica all'utente
        console.error(e);
        res.json({ ok: false ,errore: e.message  } );
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on ' + PORT));
