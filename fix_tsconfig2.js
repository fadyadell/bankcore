const fs = require('fs');
const path = require('path');

function processTsConfig(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace non-relative paths inside include and exclude
    content = content.replace(/\"src\//g, '\"./src/');
    content = content.replace(/\"dist\//g, '\"./dist/');
    content = content.replace(/\"libs\//g, '\"./libs/');
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed include/exclude paths in', filePath);
}

const appsDir = path.join(__dirname, 'apps');
const libsDir = path.join(__dirname, 'libs');

if (fs.existsSync(appsDir)) {
    fs.readdirSync(appsDir).forEach(app => {
        processTsConfig(path.join(appsDir, app, 'tsconfig.app.json'));
    });
}

if (fs.existsSync(libsDir)) {
    fs.readdirSync(libsDir).forEach(lib => {
        processTsConfig(path.join(libsDir, lib, 'tsconfig.lib.json'));
    });
}
