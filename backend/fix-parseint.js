import fs from 'fs';
import path from 'path';

const dirs = ['controller', 'service'];

const idPatterns = [
  'id', 'photoId', 'userId', 'mitraId', 'unitId', 'bookingId', 'orderId', 'item.snackId', 's.snackId'
];

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const pattern of idPatterns) {
        // Regex to match parseInt(pattern) with word boundaries
        // Escaping the dot in item.snackId
        const safePattern = pattern.replace(/\./g, '\\.');
        const regex = new RegExp(`parseInt\\(\\s*${safePattern}\\s*\\)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, pattern);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed parseInt in ${fullPath}`);
      }
    }
  }
}

for (const dir of dirs) {
  processDir(dir);
}
console.log("Done fixing parseInt for IDs");
