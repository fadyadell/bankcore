const fs = require('fs');
const path = require('path');

function fixImportsInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImportsInDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Fix imports
        if (line.includes('from \'@bankcore/database\'') && !line.includes('DatabaseModule') && !line.includes('PrismaService')) {
          lines[i] = line.replace('@bankcore/database', '@prisma/client');
          changed = true;
        } else if (line.includes('from \'@bankcore/database\'') && (line.includes('DatabaseModule') || line.includes('PrismaService'))) {
          const match = line.match(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+'@bankcore\/database'/);
          if (match) {
            const imports = match[1].split(',').map(s => s.trim());
            const dbImports = imports.filter(i => i === 'DatabaseModule' || i === 'PrismaService');
            const prismaImports = imports.filter(i => i !== 'DatabaseModule' && i !== 'PrismaService');
            
            if (prismaImports.length > 0) {
              const typePrefix = line.includes('import type') ? 'import type' : 'import';
              lines[i] = `import { ${dbImports.join(', ')} } from '@bankcore/database';\n${typePrefix} { ${prismaImports.join(', ')} } from '@prisma/client';`;
              changed = true;
            }
          }
        }

        // Fix tx any
        if (line.includes('async (tx) => {')) {
          lines[i] = line.replace('async (tx) => {', 'async (tx: any) => {');
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log(`Fixed in ${fullPath}`);
      }
    }
  }
}

fixImportsInDir(path.join(__dirname, 'apps'));
