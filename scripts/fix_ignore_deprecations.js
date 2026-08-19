const fs = require('fs');
const path = require('path');

function processTsConfig(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('ignoreDeprecations')) {
    content = content.replace(
      /"compilerOptions"\s*:\s*\{/,
      '"compilerOptions": {\n    "ignoreDeprecations": "6.0",',
    );
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
}

const appsDir = path.join(process.cwd(), 'apps');
const libsDir = path.join(process.cwd(), 'libs');

[appsDir, libsDir].forEach((dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((subDir) => {
      const subDirPath = path.join(dir, subDir);
      if (fs.statSync(subDirPath).isDirectory()) {
        ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.lib.json'].forEach((file) => {
          processTsConfig(path.join(subDirPath, file));
        });
      }
    });
  }
});

processTsConfig(path.join(process.cwd(), 'tsconfig.base.json'));
