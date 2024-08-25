import dotenv from 'dotenv';
import fs from 'fs-extra';
import flat from 'flat';
import { extractSheets } from 'spreadsheet-to-json';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Decode the Google Sheet secret
const key = Buffer.from(process.env.GOOGLE_SHEET_SECRET_BASE64, 'base64').toString('utf8');

// Extract sheets from Google Sheets
extractSheets(
  {
    spreadsheetKey: process.env.GOOGLE_SHEET_TABLE_ID_I18NTable,
    credentials: JSON.parse(key),
    sheetsToExtract: ['common', 'user', 'article', 'email', 'image', 'ValidationErrorMessage', "api"]
  },
  (err, data) => {
    if (err) throw err;
    const read = [];
    Object.keys(data).forEach(t => read.push(...data[t]));
    const result = {};
    const files = [];
    for (const key in read[0]) {
      if (key !== 'key') {
        files.push(key);
        result[key] = {};
      }
    }
    read.forEach((el) => {
      for (const file of files) {
        result[file][el.key] = el[file] ? el[file] : '';
      }
    });
    const outputDir = path.resolve(__dirname, '../i18n/language');

    // Ensure the directory exists only once
    fs.ensureDirSync(outputDir);
    const writeFiles = files.map((fileName) => {
      const outputPath = path.join(outputDir, `${fileName}.js`);

      // Stringify with keys wrapped in quotes
      const content = `export default ${JSON.stringify(
        flat.unflatten(result[fileName], { object: true }),
        null,
        2
      )};\n`;

      // Use async method for non-blocking I/O operations
      return fs.writeFile(outputPath, content);
    });

    // Wait for all files to be written
    Promise.all(writeFiles)
      .then(() => console.log('All files written successfully!'))
      .catch((err) => console.error('Error writing files:', err));
  }
);
