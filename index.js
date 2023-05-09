const Converter = require('csv-converter-to-pdf-and-html');
const path = require('path');
const express = require('express');
const port = 8000;
const fs = require('fs');
const csv = require('csv-parser');
const handlebars = require('handlebars');
const { engine } = require('express-handlebars');
const multer = require('multer');
const { log } = require('console');

const templateCompiler = require('./helpers/templateCompiler');
const readConverted = require('./helpers/readConverted');

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
  let count = 0;
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error processing file upload');
    } else {
      const data = [];
      // Grab name of template that was selected by user
      const selectedTemplate = req.body.template;
      // Use the appropriate template function to generate the HTML content
      const source = fs.readFileSync(
        path.join(__dirname, 'views/layouts', `${selectedTemplate}.hbs`),
        'utf8'
      );
      const template = handlebars.compile(source);
      // Parse the CSV file and create an HTML file for each row
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          count++;
          console.log(
            'inside .post/convert, looking at the row variable:',
            row
          );
          const html = templateCompiler(selectedTemplate, row, template);
          const outputName = `output-rowNum-${count}.html`;
          const outputPath = path.join(__dirname, 'converted', outputName);
          fs.writeFile(outputPath, html, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`File ${outputName} created successfully`);
            }
          });
          data.push(row);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
        });
      res.redirect('/converted/success');
    }
  });
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
