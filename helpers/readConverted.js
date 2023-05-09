const readConverted = (res, err, files) => {
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
};

module.exports = readConverted;
