const path = require('path');
const express = require('express');
const port = 8000;
const fs = require('fs');
const { engine } = require('express-handlebars');
const multer = require('multer');
const readConverted = require('./helpers/readConverted');
const convertCSV = require('./helpers/convertCSV');

const app = express();
app.engine(
  'handlebars',
  engine({ extname: '.hbs', defaultLayout: 'template' })
);
app.set('view engine', 'handlebars');

app.use(express.static('public/uploads')); // makes this directory the static directory for uploads
app.use('/converted', express.static('converted')); // Serve static files in the 'converted' directory

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
var upload = multer({ storage: storage }).single('csv');

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
  //the .sendFile method needs the absolute path to the file
});

const convertedRouter = express.Router(); // Define a new router for showing the converted files

convertedRouter.get('/success', (req, res) => {
  fs.readdir('converted', (err, files) => {
    readConverted(res, err, files);
  });
});

// Use the new router for the '/converted' route
app.use('/converted', convertedRouter);

app.post('/convert', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error processing file upload');
    } else {
      console.log('inside of index.js function');
      convertCSV(req, res);
      res.redirect('/converted/success');
    }
  });
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
