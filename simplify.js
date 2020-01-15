const fs = require('fs');
const path = require('path');

if (process.argv.length < 5) {
    console.log('node simplify.js working_directory year month');
    process.exit(-1);
}


let workDir = process.argv[2];

let year = process.argv[3];
let month = process.argv[4];

// Read CSV data
let csvFilename = path.join(workDir, `vidurkiai${year}${month}.csv`);
let csvdata = fs.readFileSync(csvFilename).toString().split('\n');

let dataByCode = {};

function extractNumber(str) {
    return parseFloat(str.trim().replace(',', '.'));
}

for (let line of csvdata) {
    let data = line.split(';')

    if (data.length > 11 && data[1].length > 0) {
        let code = data[1];
        dataByCode[code] = {
            'a': extractNumber(data[2]),
            'a3': extractNumber(data[7]) || undefined, // average
            'm3': extractNumber(data[8]) || undefined, // median
            'f3': extractNumber(data[9]) || undefined, // first 25%
            'l3': extractNumber(data[10]) || undefined, // last 25%
            's3': extractNumber(data[11]) || undefined, // std
        }
    }
}

// Read JSON data
let jsonFilename = path.join(workDir, `monthly-${year}.json`);

let rawdata = fs.readFileSync(jsonFilename);
let monthly = JSON.parse(rawdata);

let monthInt = parseInt(year, 10) * 100 + parseInt(month, 10);

let processed = [];
for (let monthData of monthly) {
    if (monthData.avgWage && monthData.month === monthInt) {
        let processedData = {
            n: monthData.name,
            w: monthData.avgWage,
            e: monthData.ecoActName || undefined,
            m: monthData.municipality,
            i: monthData.numInsured,
        }

        if (monthData.code in dataByCode) {
            if (monthData.avgWage === dataByCode[monthData.code].a) {
                processedData = {
                    ...processedData,
                    ...dataByCode[monthData.code],
                }
            } else {
                console.log('Problem with data', monthData.name, monthData.avgWage, dataByCode[monthData.code].a);
            }
        }

        processed.push(processedData);
    }
}

fs.mkdirSync('data', { recursive: true });

let data = JSON.stringify(processed, null, 2);
fs.writeFileSync(path.join(workDir, `${monthInt}.json`), data);
