const fs = require('fs');
const childProcess = require('child_process');

let mainFile = JSON.parse(fs.readFileSync('./package.json').toString()).module;
if (!mainFile.startsWith('.')) {
  // ESM imports of files must start with ./
  mainFile = `./${mainFile}`;
}
const cjsFile = './tmp.cjs';
const esmFile = './tmp.mjs';
const cjs = `const x = require('.')\nconsole.log(x)`;
const esm = `import * as x from '${mainFile}';\nconsole.log(x)`;

fs.writeFileSync(cjsFile, cjs);
fs.writeFileSync(esmFile, esm);

const result1 = childProcess.spawnSync('node', [cjsFile], {
  cwd: __dirname,
});
const result2 = childProcess.spawnSync('node', [esmFile], {
  cwd: __dirname,
});

fs.unlinkSync(cjsFile);
fs.unlinkSync(esmFile);

const errors = [];
if (result1.status !== 0) {
  errors.push(result1.stderr.toString());
}
if (result2.status !== 0) {
  errors.push(result2.stderr.toString());
}
if (errors.length > 0) {
  console.error(
    `Failed to run this library under CJS or ESM. Errors:\n${errors.join('\n')}`,
  );
  process.exit(1);
}
