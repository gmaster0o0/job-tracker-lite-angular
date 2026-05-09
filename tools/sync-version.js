const fs = require('fs');
const path = require('path');
// A gyökér package.json beolvasása
const packageJson = require('../package.json');

// Az Nx struktúrád szerinti elérési út az Angular environment fájlhoz
const envPath = path.resolve(
  __dirname,
  '../apps/frontend/src/environments/version.ts',
);

try {
  const content = fs.readFileSync(envPath, 'utf8');

  // Lecseréli a 'version: ...' részt, függetlenül attól mi volt ott
  const updatedContent = content.replace(
    /version:\s*'.*'/g,
    `version: '${packageJson.version}'`,
  );

  fs.writeFileSync(envPath, updatedContent, 'utf8');
  console.log(`🚀 Verzió szinkronizálva: ${packageJson.version}`);
} catch (err) {
  console.error('❌ Hiba a verzió szinkronizálásakor:', err.message);
}
