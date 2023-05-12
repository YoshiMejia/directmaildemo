const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

const downloadConverted = (req, res) => {
  const folderName = 'converted';
  const folderPath = path.join(path.resolve(__dirname, '..'), 'converted');
  const zipName = folderName + '.zip';
  const zipPath = path.resolve(__dirname, '..', 'converted', zipName);
  // Create a new Archiver instance with the 'zip' format and compression level of 9
  const archive = archiver('zip', { zlib: { level: 9 } });
  // Create a writable stream to save the ZIP file to disk
  const output = fs.createWriteStream(zipPath);
  // Pipe the archive to the output stream
  archive.pipe(output);
  // Read all files in the folder and add them to the archive
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating ZIP file');
      return;
    }
    // Add each file to the archive with the same name as the original file
    files.forEach((filename) => {
      const filePath = path.join(folderPath, filename);
      archive.file(filePath, { name: filename });
    });
    // Finalize the archive once all files have been added
    archive.finalize();
  });
  // Send the ZIP file to the client for download once the output stream is closed
  output.on('close', () => {
    res.download(zipPath);
  });

  archive.on('error', (err) => {
    console.error(err);
    res.status(500).send('Error creating ZIP file');
  });

  archive.on('finish', () => {
    console.log(`ZIP file ${zipPath} created`);
  });
};

module.exports = downloadConverted;
