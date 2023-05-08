const express = require('express');
const multer = require('multer');
const csvtojson = require('csvtojson');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const upload = multer({dest: 'uploads/'});

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.post('/upload', upload.single('csvFile'), (req, res) => {
    const file = req.file;
    if (file.mimetype == 'text/csv')
    {
        csvtojson().fromFile(req.file.path).then((jsonObj) => {
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(jsonObj);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const buffer = xlsx.write(workbook, {type: 'buffer'});
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=converted.xlsx');
            res.send(buffer);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('An error occurred');
        });
    }
    else
    {
        res.render('upload', {error: "100"});
    }
})

app.get('/', (req, res) => {
    res.render('upload', {error: "0"});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Listening on port: '+PORT);
})