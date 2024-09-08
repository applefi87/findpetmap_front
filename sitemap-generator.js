const fs = require('fs');

const paths = [
  { path: '/article/' },
  { path: '/' },
]


const baseUrl = 'https://findpetmap.com'; // Replace with your website's base URL
const outputFilePath = './public/sitemap.xml';

const today = new Date().toISOString().split('T')[0];
const generateSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  paths.forEach((path) => {
    xml += '<url>\n';
    xml += `<loc>${baseUrl}${path.path}</loc>\n`;
    xml += `<lastmod>${today}</lastmod>`
    xml += '</url>\n';
  });

  xml += '</urlset>';

  fs.writeFile(outputFilePath, xml, (err) => {
    if (err) {
      console.error('An error occurred while generating the sitemap:', err);
    } else {
      console.log('Sitemap generated successfully!');
    }
  });
};

generateSitemap();
