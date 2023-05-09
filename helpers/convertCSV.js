const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const csv = require('csv-parser');
const templateCompiler = require('./templateCompiler');

let count = 0;
const convertCSV = (req, res) => {
  console.log('dirname:', __dirname);
  const data = [];
  // Grab name of template that was selected by user
  const selectedTemplate = req.body.template;
  // Use the appropriate template function to generate the HTML content
  const source = fs.readFileSync(
    // path.join(__dirname, 'views/layouts', `${selectedTemplate}.hbs`),
    path.join('./views/layouts', `${selectedTemplate}.hbs`),
    'utf8'
  );
  const template = handlebars.compile(source);
  // Parse the CSV file and create an HTML file for each row
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      count++;
      const html = templateCompiler(selectedTemplate, row, template);
      const outputName = `output-rowNum-${count}.html`;
      const outputPath = path.join('./converted', outputName);
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
};

module.exports = convertCSV;
