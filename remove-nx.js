const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('{apps,libs}/*/package.json');
files.push('package.json');
for (const file of files) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    try {
      const json = JSON.parse(content);
      if (json.nx) {
        delete json.nx;
        fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
        console.log('Removed nx from', file);
      }
    } catch (e) {
      console.log('Error parsing', file);
    }
  }
}
