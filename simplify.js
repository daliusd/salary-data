const fs = require('fs');
const path = require('path');

if (process.argv.length < 5) {
    console.log('node simplify.js working_directory year month');
    process.exit(-1);
}

let workDir = process.argv[2];

let year = process.argv[3];
let month = process.argv[4];
let jsonFilename = path.join(workDir, `monthly-${year}.json`);

let rawdata = fs.readFileSync(jsonFilename);
let monthly = JSON.parse(rawdata);

let monthInt = parseInt(year, 10) * 100 + parseInt(month, 10);

let processed = [];
for (let monthData of monthly) {
    if (monthData.avgWage && monthData.month === monthInt) {
        processed.push({
            n: monthData.name,
            w: monthData.avgWage,
            e: monthData.ecoActName || undefined,
            m: monthData.municipality,
            i: monthData.numInsured,
        });
    }
}

fs.mkdirSync('data', { recursive: true });

let data = JSON.stringify(processed, null, 2);
fs.writeFileSync(path.join(workDir, `${monthInt}.json`), data);
