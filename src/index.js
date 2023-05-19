const cors = require('cors');
const path = require('path');
const express = require('express');
const port = process.env.PORT || 8000;
const AWS = require('aws-sdk');
const fs = require('fs');
const { engine } = require('express-handlebars');
const handlebars = require('handlebars');
const templateCompiler = require('./helpers/templateCompiler');
const csv = require('csv-parser');
const multer = require('multer');
const readConverted = require('./helpers/readConverted');
const downloadConverted = require('./helpers/downloadConverted');

AWS.config.update({
  accessKeyId: 'AKIAQTX2CLHWRCLH4EWP',
  secretAccessKey: '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',
  region: 'us-west-1',
});
const dynamodb = new AWS.DynamoDB();
const currentDate = new Date().toLocaleDateString('en-US');

const app = express();
app.engine(
  'handlebars',
  engine({ extname: '.hbs', defaultLayout: 'template' })
);
app.set('view engine', 'handlebars');

app.use(express.static('../public/uploads')); // makes this directory the static directory for uploads
app.use('/converted', express.static('converted')); // Serve static files in the 'converted' directory
app.use(cors());

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/uploads');
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
    const folderPath = path.join(__dirname, 'converted');
    readConverted(res, err, files, folderPath);
  });
});

// Use the new router for the '/converted' route
app.use('/converted', convertedRouter);

//removed modularized convertCSV function from /convert endpoint due to HTTP HEADERS error caused by multer. at the moment this endpoint converts to CSV and also uploads to DynamoDB. Need to refactor in future.
app.post('/convert', (req, res) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const milliseconds = new Date().getMilliseconds();
  let count = 0;
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error processing file upload');
    } else {
      const data = [];
      const selectedTemplate = req.body.template;
      const source = fs.readFileSync(
        path.join(__dirname, 'views/layouts', `${selectedTemplate}.hbs`),
        'utf8'
      );
      const template = handlebars.compile(source);
      const convertedData = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          count++;
          const html = templateCompiler(selectedTemplate, row, template);
          convertedData.push(html);
          const outputName = `output-rowNum-${
            count + '-' + currentTime + ' - ' + milliseconds
          }.html`;
          const outputPath = path.join(__dirname, 'converted', outputName);
          fs.writeFile(outputPath, html, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`File ${outputName} created successfully`);
              const params = {
                TableName: 'DirectMail',
                Item: {
                  filename: { S: outputName },
                  dateCreated: { S: currentDate },
                  htmlContent: { S: html },
                  template: { S: selectedTemplate },
                },
              };
              dynamodb.putItem(params, (err, data) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log(
                    `HTML file ${outputName} uploaded to DynamoDB successfully`
                  );
                }
              });
            }
          });
          data.push(row);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
          res.json({ convertedData });
        });
    }
  });
});

app.get('/download_converted/:folderName', (req, res) => {
  downloadConverted(req, res);
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
