const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{apps,libs}/**/tsconfig*.json');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  try {
    const json = JSON.parse(content);
    if (json.references) {
      json.references = json.references.filter(ref => 
        ref.path && 
        !ref.path.includes('libs/rules') && 
        !ref.path.includes('libs/rabbitmq')
      );
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
    }
  } catch (e) {
    console.error('Error parsing', file, e);
  }
}
