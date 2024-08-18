require('dotenv').config()
const fs = require('fs-extra')
const unflatten = require('flat').unflatten
const { extractSheets } = require('spreadsheet-to-json')
const path = require('path')
// const key = atob(process.env.GOOGLE_SHEET)
const key = Buffer.from(process.env.GOOGLE_SHEET_SECRET_BASE64, 'base64').toString('utf8')
//
// https://ithelp.ithome.com.tw/m/articles/10262354
extractSheets(
  {
    spreadsheetKey: process.env.GOOGLE_SHEET_TABLE_ID_I18NTable,
    credentials: JSON.parse(key),
    sheetsToExtract: ['user', 'article', "email", "image", "ValidationErrorMessage"]
  },
  (err, data) => {
    if (err) throw err
    const read = []
    Object.keys(data).forEach(t => read.push(...data[t]))
    const result = {}
    const files = []
    for (const key in read[0]) {
      if (key !== 'key') {
        files.push(key)
        result[key] = {}
      }
    }
    read.forEach((el) => {
      for (const file of files) {
        result[file][el.key] = el[file] ? el[file] : ''
      }
    })
    const outputDir = path.resolve(__dirname, '../i18n/language');

    // Ensure the directory exists only once
    fs.ensureDirSync(outputDir);
    const writeFiles = files.map((fileName) => {
      const outputPath = path.join(outputDir, `${fileName}.js`);
      const content = `export default ${JSON.stringify(
        unflatten(result[fileName], { object: true }),
        null,
        2
      ).replace(/"([^"]+)":/g, '$1:')};\n`;

      // Use async method for non-blocking I/O operations
      return fs.writeFile(outputPath, content);
    });

    // Wait for all files to be written
    Promise.all(writeFiles)
      .then(() => console.log('All files written successfully!'))
      .catch((err) => console.error('Error writing files:', err));
  }
)
