const fs = require('fs');

const paths = [
  { path: '/article/' },
  // { path: '/article/add' },
  // { path: '/article/:id' },
  { path: '/board/' },
  // { path: '/board/:id' },
  // { path: '/adminLogin' },
  // { path: '/admin/' },
  // { path: '/admin/article' },
  { path: '/' },
  // { path: '/me/edit' },
  // { path: '/me/editProfile' },
  // { path: '/me/editBadges' },
  // { path: '/changePWD' },
  // { path: '/forgetPWD' },
]


const baseUrl = 'https://knowforum.com'; // Replace with your website's base URL
const outputFilePath = './public/sitemap.xml';

const today = "2023-07-12"
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
