const fs = require('fs');
const path = require('path');

function processTsConfig(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace non-relative paths inside compilerOptions
    content = content.replace(/\"rootDir\"\s*:\s*\"src\"/g, '\"rootDir\": \"./src\"');
    content = content.replace(/\"outDir\"\s*:\s*\"dist\"/g, '\"outDir\": \"./dist\"');
    content = content.replace(/\"tsBuildInfoFile\"\s*:\s*\"dist/g, '\"tsBuildInfoFile\": \"./dist');
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
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
