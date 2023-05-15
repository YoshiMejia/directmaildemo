const cors = require('cors');
const path = require('path');
const express = require('express');
const port = 8000;
const fs = require('fs');
const csv = require('csv-parser');
const handlebars = require('handlebars');
const { engine } = require('express-handlebars');
const multer = require('multer');
// const readConverted = require('./helpers/readConverted');
// const convertCSV = require('./helpers/convertCSV');

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

const firstTemplateFn = (row, template) => {
  const name = row.name || 'no name';
  const age = row.age || '98';
  const country = row.country || 'Content';
  const whatever = row.whatever || 'whatevaaaa';
  const html = template({ name, age, country, whatever });
  return html;
};

const secondTemplateFn = (row, template) => {
  const borrower_first_name = row.borrower_first_name || 'NFN';
  const borrower_last_name = row.borrower_last_name || 'NLN';
  const borrower_address_1 = row.borrower_address_1 || 'no address1';
  const borrower_address_2 = row.borrower_address_2 || 'no address2';
  const borrower_city = row.borrower_city || 'no city';
  const borrower_state = row.borrower_state || 'no state';
  const borrower_postal_code = row.borrower_postal_code || 'no zip';
  const branch_address_1 = row.branch_address_1 || 'no branch add1';
  const branch_address_2 = row.branch_address_2 || 'no branch add2';
  const branch_city = row.branch_city || 'no branch city';
  const branch_state = row.branch_state || 'no branch state';
  const branch_postal_code = row.branch_postal_code || 'no branch zip';
  const branch_phone = row.branch_phone || 'no branch phone';
  const loan_available_credit = row.loan_available_credit || 'no credit';
  const loan_current_due_date = row.loan_current_due_date || 'no loan date';
  const loan_total_amount_due = row.loan_total_amount_due || 'nothing due';
  const branch_manager_name = row.branch_manager_name || 'no manager';
  const current_year = row.current_year || 'never';
  const html = template({
    borrower_first_name,
    borrower_last_name,
    borrower_address_1,
    borrower_address_2,
    borrower_city,
    borrower_state,
    borrower_postal_code,
    branch_address_1,
    branch_address_2,
    branch_city,
    branch_state,
    branch_postal_code,
    branch_phone,
    loan_available_credit,
    loan_current_due_date,
    loan_total_amount_due,
    branch_manager_name,
    current_year,
  });
  return html;
};

const templateCompiler = (selectedTemplate, row, template) => {
  switch (selectedTemplate) {
    case 'template1':
      return firstTemplateFn(row, template);
    case 'template2':
      return secondTemplateFn(row, template);
    default:
      return 'Unknown';
  }
};

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
  //the .sendFile method needs the absolute path to the file
});

const convertedRouter = express.Router(); // Define a new router for showing the converted files
convertedRouter.get('/success', (req, res) => {
  // Read the contents of the 'converted' directory
  fs.readdir('converted', (err, files) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving files');
    } else {
      // Generate an HTML response with a list of the files
      const fileList = files
        .map(
          (filename) =>
            `<li><a href="/converted/${filename}">${filename}</a></li>`
        )
        .join('');
      const html = `
                <html>
                  <head>
                    <title>Converted Files</title>
                  </head>
                  <body>
                    <h1>Converted Files</h1>
                    <ul>
                      ${fileList}
                    </ul>
                  </body>
                </html>
              `;
      res.send(html);
    }
  });
});

// Use the new router for the '/converted' route
app.use('/converted', convertedRouter);

// app.post('/convert', (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send('Error processing file upload');
//     } else {
//       console.log('inside of index.js function');
//       convertCSV(req, res);
//       res.redirect('/converted/success');
//     }
//   });
// });

app.post('/convert', (req, res) => {
  let count = 0;
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error processing file upload');
    } else {
      const data = [];
      const selectedTemplate = req.body.template;
      console.log('line 157 selectedTemplate:', selectedTemplate);
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
          res.json({ convertedData });
        });
    }
  });
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
