const path = require('path');

const readConverted = (res, err, files, folderPath) => {
  if (err) {
    console.log(err);
    res.status(500).send('Error retrieving files');
  } else {
    // Generate an HTML response with a list of the files and a link to download the folder
    const fileList = files
      .map((filename) => {
        const filePath = path.join(folderPath, filename);
        const relativePath = path.relative(folderPath, filePath);
        return `<li><a href="/converted/${filename}">${relativePath}</a></li>`;
      })
      .join('');
    const folderName = path.basename(folderPath);
    const downloadLink = `<a href="/download_converted/${folderName}">Download ${folderName}</a>`;
    const html = `
                <html>
                  <head>
                    <title>Converted Files</title>
                  </head>
                  <body>
                    <h1>Converted Files ${folderName}</h1>
                    <ul>
                      ${fileList}
                    </ul>
                    ${downloadLink}
                  </body>
                </html>
              `;
    res.send(html);
  }
};

module.exports = readConverted;
