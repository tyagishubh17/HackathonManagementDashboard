const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Fix imports
  content = content.replace(/import\s+\{\s*api\s*\}\s+from\s+["'].*(hooks\/useAuth|lib\/api)["'];/g, 'import { api } from "@/lib/api";');
  
  // Fix implicit any
  content = content.replace(/\.then\(\s*res\s*=>/g, '.then((res: any) =>');
  
  // Also catch catch(err =>
  content = content.replace(/\.catch\(\s*err\s*=>/g, '.catch((err: any) =>');
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log("Fixed", file);
  }
}
console.log(`Changed ${changed} files.`);
