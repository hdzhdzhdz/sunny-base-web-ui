import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

execSync(
  'tsup src/index.ts --format cjs,esm --dts --clean --splitting false --external lucide-vue-next --external @iconify/vue --external vue',
  { stdio: 'inherit', cwd: __dirname },
);

const esmPath = join(__dirname, 'dist/index.js');
let esm = readFileSync(esmPath, 'utf-8');

// Remove the __reExport helper and all __reExport calls
// Replace with proper `export * from "lucide-vue-next"`
esm = esm.replace(
  /\/\/ src\/index\.ts\n__reExport\(index_exports, lucide_exports\);/,
  '// src/index.ts\nexport * from "lucide-vue-next";',
);

// Remove the lucide.ts module namespace entirely (no longer needed for re-export chain)
esm = esm.replace(
  /\/\/ src\/lucide\.ts\nvar lucide_exports = \{\};[\s\S]*?__reExport\(lucide_exports, lucide_vue_next_star\);\n/,
  '// src/lucide.ts\n',
);
esm = esm.replace(
  /import \* as lucide_vue_next_star from "lucide-vue-next";\n/,
  '',
);

writeFileSync(esmPath, esm);
console.log('Post-processed ESM output to use static re-exports');
