const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    console.log('node buildindex.js working_directory');
    process.exit(-1);
}

let workDir = process.argv[2];

let filenames = fs.readdirSync(workDir);

let months = [];

for (const filename of filenames) {
    if (filename.endsWith('.json') && !filename.startsWith('monthly-') && filename !== 'index.json') {
        months.push(filename);
    }
}

console.log(months);

let data = JSON.stringify(months, null, 2);
fs.writeFileSync(path.join(workDir, 'index.json'), data);
