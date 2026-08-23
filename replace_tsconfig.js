const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('tsconfig.app.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('prisma-client')) {
        content = content.replace(/prisma-client/g, 'database');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'apps'));
