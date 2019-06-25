const fs = require('fs');

const pkg = fs.readFileSync('package.json', 'utf-8');
const distPkg = pkg.replace('src/index.js', 'dist/index.js');

fs.writeFileSync('package.json', distPkg, 'utf-8');
